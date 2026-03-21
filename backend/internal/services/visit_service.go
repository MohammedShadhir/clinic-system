package services

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/abc-health/clinic-system/internal/db"
	"github.com/abc-health/clinic-system/internal/models"
	"github.com/google/uuid"
)

type VisitService struct {
	ai *AIService
}

func NewVisitService(ai *AIService) *VisitService {
	return &VisitService{ai: ai}
}

// CreateVisit creates a new visit and triggers AI classification
func (s *VisitService) CreateVisit(req *models.CreateVisitRequest) (*models.Visit, *models.AIClassificationResult, error) {
	visitID := uuid.New().String()

	_, err := db.DB.Exec(`
		INSERT INTO visits (id, patient_id, doctor_id, raw_input, visit_date, status)
		VALUES ($1, $2, $3, $4, $5, 'draft')`,
		visitID, req.PatientID, req.DoctorID, req.RawInput, time.Now(),
	)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to create visit: %w", err)
	}

	// Run AI classification
	aiResult, err := s.ai.ClassifyNotes(req.RawInput)
	if err != nil {
		return nil, nil, fmt.Errorf("AI classification failed: %w", err)
	}

	visit, err := s.GetVisit(visitID)
	if err != nil {
		return nil, nil, err
	}

	return visit, aiResult, nil
}

// FinalizeVisit saves the confirmed parsed data and generates bill
func (s *VisitService) FinalizeVisit(req *models.FinalizeVisitRequest) (*models.Visit, error) {
	tx, err := db.DB.Begin()
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Clear previous parsed data
	tx.Exec(`DELETE FROM prescriptions WHERE visit_id = $1`, req.VisitID)
	tx.Exec(`DELETE FROM lab_tests WHERE visit_id = $1`, req.VisitID)
	tx.Exec(`DELETE FROM clinical_notes WHERE visit_id = $1`, req.VisitID)

	// Insert prescriptions
	for _, p := range req.Prescriptions {
		price := s.lookupDrugPrice(p.DrugName)
		_, err := tx.Exec(`
			INSERT INTO prescriptions (id, visit_id, drug_name, dosage, frequency, duration, route, notes, unit_price, quantity)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
			uuid.New().String(), req.VisitID, p.DrugName, p.Dosage,
			p.Frequency, p.Duration, p.Route, p.Notes, price, 1,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to insert prescription: %w", err)
		}
	}

	// Insert lab tests
	for _, lt := range req.LabTests {
		price := s.lookupTestPrice(lt.TestName, lt.TestCode)
		priority := lt.Priority
		if priority == "" {
			priority = "routine"
		}
		_, err := tx.Exec(`
			INSERT INTO lab_tests (id, visit_id, test_name, test_code, priority, notes, price)
			VALUES ($1, $2, $3, $4, $5, $6, $7)`,
			uuid.New().String(), req.VisitID, lt.TestName, lt.TestCode,
			priority, lt.Notes, price,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to insert lab test: %w", err)
		}
	}

	// Insert clinical notes
	for _, cn := range req.ClinicalNotes {
		category := cn.Category
		if category == "" {
			category = "observation"
		}
		_, err := tx.Exec(`
			INSERT INTO clinical_notes (id, visit_id, category, content)
			VALUES ($1, $2, $3, $4)`,
			uuid.New().String(), req.VisitID, category, cn.Content,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to insert clinical note: %w", err)
		}
	}

	// Update visit status
	_, err = tx.Exec(`UPDATE visits SET status='finalized', updated_at=NOW() WHERE id=$1`, req.VisitID)
	if err != nil {
		return nil, fmt.Errorf("failed to update visit: %w", err)
	}

	if err = tx.Commit(); err != nil {
		return nil, fmt.Errorf("transaction commit failed: %w", err)
	}

	// Generate bill
	if err := s.GenerateBill(req.VisitID); err != nil {
		return nil, fmt.Errorf("billing failed: %w", err)
	}

	return s.GetVisit(req.VisitID)
}

// GenerateBill calculates and stores the bill for a visit
func (s *VisitService) GenerateBill(visitID string) error {
	const consultationFee = 30.00
	const taxRate = 0.05 // 5% tax

	// Calculate drug total
	var drugTotal float64
	row := db.DB.QueryRow(`SELECT COALESCE(SUM(unit_price * quantity), 0) FROM prescriptions WHERE visit_id = $1`, visitID)
	row.Scan(&drugTotal)

	// Calculate lab total
	var labTotal float64
	row = db.DB.QueryRow(`SELECT COALESCE(SUM(price), 0) FROM lab_tests WHERE visit_id = $1`, visitID)
	row.Scan(&labTotal)

	subtotal := consultationFee + drugTotal + labTotal
	taxAmount := subtotal * taxRate
	totalAmount := subtotal + taxAmount

	// Upsert bill
	billID := uuid.New().String()
	_, err := db.DB.Exec(`
		INSERT INTO bills (id, visit_id, consultation_fee, drug_total, lab_total, other_charges, discount, tax_amount, total_amount, status)
		VALUES ($1, $2, $3, $4, $5, 0, 0, $6, $7, 'pending')
		ON CONFLICT (visit_id) DO UPDATE SET
			consultation_fee=$3, drug_total=$4, lab_total=$5,
			tax_amount=$6, total_amount=$7, updated_at=NOW()`,
		billID, visitID, consultationFee, drugTotal, labTotal, taxAmount, totalAmount,
	)
	if err != nil {
		return fmt.Errorf("failed to upsert bill: %w", err)
	}

	// Get the actual bill id (in case of update)
	var actualBillID string
	db.DB.QueryRow(`SELECT id FROM bills WHERE visit_id = $1`, visitID).Scan(&actualBillID)

	// Clear and recreate line items
	db.DB.Exec(`DELETE FROM bill_items WHERE bill_id = $1`, actualBillID)

	// Consultation line item
	db.DB.Exec(`
		INSERT INTO bill_items (id, bill_id, category, description, quantity, unit_price, total)
		VALUES ($1, $2, 'consultation', 'Consultation Fee', 1, $3, $3)`,
		uuid.New().String(), actualBillID, consultationFee,
	)

	// Drug line items
	rows, _ := db.DB.Query(`SELECT drug_name, quantity, unit_price FROM prescriptions WHERE visit_id = $1`, visitID)
	if rows != nil {
		defer rows.Close()
		for rows.Next() {
			var name string
			var qty int
			var price float64
			rows.Scan(&name, &qty, &price)
			db.DB.Exec(`
				INSERT INTO bill_items (id, bill_id, category, description, quantity, unit_price, total)
				VALUES ($1, $2, 'drug', $3, $4, $5, $6)`,
				uuid.New().String(), actualBillID, name, qty, price, float64(qty)*price,
			)
		}
	}

	// Lab test line items
	labRows, _ := db.DB.Query(`SELECT test_name, price FROM lab_tests WHERE visit_id = $1`, visitID)
	if labRows != nil {
		defer labRows.Close()
		for labRows.Next() {
			var name string
			var price float64
			labRows.Scan(&name, &price)
			db.DB.Exec(`
				INSERT INTO bill_items (id, bill_id, category, description, quantity, unit_price, total)
				VALUES ($1, $2, 'lab', $3, 1, $4, $4)`,
				uuid.New().String(), actualBillID, name, price,
			)
		}
	}

	// Tax line item
	if taxAmount > 0 {
		db.DB.Exec(`
			INSERT INTO bill_items (id, bill_id, category, description, quantity, unit_price, total)
			VALUES ($1, $2, 'tax', 'Tax (5%)', 1, $3, $3)`,
			uuid.New().String(), actualBillID, taxAmount,
		)
	}

	return nil
}

// GetVisit returns a full visit with all related data
func (s *VisitService) GetVisit(visitID string) (*models.Visit, error) {
	var visit models.Visit
	var patient models.Patient

	err := db.DB.QueryRow(`
		SELECT v.id, v.patient_id, v.doctor_id, v.raw_input, v.visit_date, v.status, v.created_at, v.updated_at,
		       p.id, p.name, p.date_of_birth, p.gender, p.phone, p.email
		FROM visits v
		JOIN patients p ON p.id = v.patient_id
		WHERE v.id = $1`, visitID,
	).Scan(
		&visit.ID, &visit.PatientID, &visit.DoctorID, &visit.RawInput,
		&visit.VisitDate, &visit.Status, &visit.CreatedAt, &visit.UpdatedAt,
		&patient.ID, &patient.Name, &patient.DateOfBirth, &patient.Gender, &patient.Phone, &patient.Email,
	)
	if err != nil {
		return nil, fmt.Errorf("visit not found: %w", err)
	}
	visit.Patient = &patient

	// Load prescriptions
	rows, err := db.DB.Query(`SELECT id, visit_id, drug_name, dosage, frequency, duration, route, notes, unit_price, quantity, created_at FROM prescriptions WHERE visit_id = $1 ORDER BY created_at`, visitID)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var p models.Prescription
			rows.Scan(&p.ID, &p.VisitID, &p.DrugName, &p.Dosage, &p.Frequency, &p.Duration, &p.Route, &p.Notes, &p.UnitPrice, &p.Quantity, &p.CreatedAt)
			visit.Prescriptions = append(visit.Prescriptions, p)
		}
	}

	// Load lab tests
	labRows, err := db.DB.Query(`SELECT id, visit_id, test_name, test_code, priority, notes, price, created_at FROM lab_tests WHERE visit_id = $1 ORDER BY created_at`, visitID)
	if err == nil {
		defer labRows.Close()
		for labRows.Next() {
			var lt models.LabTest
			labRows.Scan(&lt.ID, &lt.VisitID, &lt.TestName, &lt.TestCode, &lt.Priority, &lt.Notes, &lt.Price, &lt.CreatedAt)
			visit.LabTests = append(visit.LabTests, lt)
		}
	}

	// Load clinical notes
	noteRows, err := db.DB.Query(`SELECT id, visit_id, category, content, created_at FROM clinical_notes WHERE visit_id = $1 ORDER BY created_at`, visitID)
	if err == nil {
		defer noteRows.Close()
		for noteRows.Next() {
			var cn models.ClinicalNote
			noteRows.Scan(&cn.ID, &cn.VisitID, &cn.Category, &cn.Content, &cn.CreatedAt)
			visit.ClinicalNotes = append(visit.ClinicalNotes, cn)
		}
	}

	// Load bill
	var bill models.Bill
	err = db.DB.QueryRow(`SELECT id, visit_id, consultation_fee, drug_total, lab_total, other_charges, discount, tax_amount, total_amount, status, created_at FROM bills WHERE visit_id = $1`, visitID).
		Scan(&bill.ID, &bill.VisitID, &bill.ConsultationFee, &bill.DrugTotal, &bill.LabTotal, &bill.OtherCharges, &bill.Discount, &bill.TaxAmount, &bill.TotalAmount, &bill.Status, &bill.CreatedAt)
	if err == nil {
		// Load bill items
		itemRows, _ := db.DB.Query(`SELECT id, bill_id, category, description, quantity, unit_price, total FROM bill_items WHERE bill_id = $1 ORDER BY category`, bill.ID)
		if itemRows != nil {
			defer itemRows.Close()
			for itemRows.Next() {
				var item models.BillItem
				itemRows.Scan(&item.ID, &item.BillID, &item.Category, &item.Description, &item.Quantity, &item.UnitPrice, &item.Total)
				bill.LineItems = append(bill.LineItems, item)
			}
		}
		visit.Bill = &bill
	}

	return &visit, nil
}

// ListVisits returns all visits with patient info
func (s *VisitService) ListVisits() ([]models.Visit, error) {
	rows, err := db.DB.Query(`
        SELECT v.id, v.patient_id, v.doctor_id, v.raw_input, v.visit_date, v.status, v.created_at, v.updated_at,
               p.id, p.name, p.gender, p.phone,
               COALESCE(rx.cnt, 0) as rx_count,
               COALESCE(lt.cnt, 0) as lt_count,
               COALESCE(b.total_amount, 0) as bill_total
        FROM visits v
        JOIN patients p ON p.id = v.patient_id
        LEFT JOIN (SELECT visit_id, COUNT(*) as cnt FROM prescriptions GROUP BY visit_id) rx ON rx.visit_id = v.id
        LEFT JOIN (SELECT visit_id, COUNT(*) as cnt FROM lab_tests GROUP BY visit_id) lt ON lt.visit_id = v.id
        LEFT JOIN bills b ON b.visit_id = v.id
        ORDER BY v.created_at DESC
        LIMIT 100`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var visits []models.Visit
	for rows.Next() {
		var v models.Visit
		var p models.Patient
		var rxCount, ltCount int
		var billTotal float64
		rows.Scan(&v.ID, &v.PatientID, &v.DoctorID, &v.RawInput, &v.VisitDate, &v.Status, &v.CreatedAt, &v.UpdatedAt,
			&p.ID, &p.Name, &p.Gender, &p.Phone,
			&rxCount, &ltCount, &billTotal)

		// Populate counts so frontend can show them
		for i := 0; i < rxCount; i++ {
			v.Prescriptions = append(v.Prescriptions, models.Prescription{})
		}
		for i := 0; i < ltCount; i++ {
			v.LabTests = append(v.LabTests, models.LabTest{})
		}
		if billTotal > 0 {
			v.Bill = &models.Bill{TotalAmount: billTotal}
		}
		v.Patient = &p
		visits = append(visits, v)
	}
	return visits, nil
}

func (s *VisitService) lookupDrugPrice(drugName string) float64 {
	var price float64
	// Try to match from catalog (case-insensitive partial match)
	err := db.DB.QueryRow(`
		SELECT unit_price FROM drug_catalog 
		WHERE LOWER(name) LIKE LOWER($1) OR LOWER(generic_name) LIKE LOWER($1)
		LIMIT 1`,
		"%"+strings.Split(drugName, " ")[0]+"%",
	).Scan(&price)
	if err != nil || price == 0 {
		return 5.00 // default price
	}
	return price
}

func (s *VisitService) lookupTestPrice(testName, testCode string) float64 {
	var price float64
	query := `SELECT price FROM test_catalog WHERE LOWER(test_code) = LOWER($1) OR LOWER(test_name) LIKE LOWER($2) LIMIT 1`
	err := db.DB.QueryRow(query, testCode, "%"+strings.Split(testName, " ")[0]+"%").Scan(&price)
	if err != nil || price == 0 {
		return 20.00 // default price
	}
	return price
}

// GetPatients returns all patients
func GetPatients() ([]models.Patient, error) {
	rows, err := db.DB.Query(`SELECT id, name, date_of_birth, gender, phone, email, created_at FROM patients ORDER BY name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var patients []models.Patient
	for rows.Next() {
		var p models.Patient
		var dob sql.NullString
		rows.Scan(&p.ID, &p.Name, &dob, &p.Gender, &p.Phone, &p.Email, &p.CreatedAt)
		if dob.Valid {
			p.DateOfBirth = dob.String
		}
		patients = append(patients, p)
	}
	return patients, nil
}

// CreatePatient adds a new patient
func CreatePatient(p *models.Patient) (*models.Patient, error) {
	p.ID = uuid.New().String()
	_, err := db.DB.Exec(`
		INSERT INTO patients (id, name, date_of_birth, gender, phone, email)
		VALUES ($1, $2, $3, $4, $5, $6)`,
		p.ID, p.Name, p.DateOfBirth, p.Gender, p.Phone, p.Email,
	)
	if err != nil {
		return nil, err
	}
	return p, nil
}

// GetDoctors returns all doctors
func GetDoctors() ([]models.Doctor, error) {
	rows, err := db.DB.Query(`SELECT id, name, speciality, license_no, created_at FROM doctors ORDER BY name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var doctors []models.Doctor
	for rows.Next() {
		var d models.Doctor
		rows.Scan(&d.ID, &d.Name, &d.Speciality, &d.LicenseNo, &d.CreatedAt)
		doctors = append(doctors, d)
	}
	return doctors, nil
}
