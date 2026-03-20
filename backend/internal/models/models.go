package models

import (
	"time"
)

// Patient represents a clinic patient
type Patient struct {
	ID          string    `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	DateOfBirth string    `json:"date_of_birth" db:"date_of_birth"`
	Gender      string    `json:"gender" db:"gender"`
	Phone       string    `json:"phone" db:"phone"`
	Email       string    `json:"email" db:"email"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

// Visit represents a single clinic visit/encounter
type Visit struct {
	ID          string    `json:"id" db:"id"`
	PatientID   string    `json:"patient_id" db:"patient_id"`
	DoctorID    string    `json:"doctor_id" db:"doctor_id"`
	RawInput    string    `json:"raw_input" db:"raw_input"`
	VisitDate   time.Time `json:"visit_date" db:"visit_date"`
	Status      string    `json:"status" db:"status"` // draft, finalized
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`

	// Populated on fetch
	Patient         *Patient          `json:"patient,omitempty"`
	Prescriptions   []Prescription    `json:"prescriptions,omitempty"`
	LabTests        []LabTest         `json:"lab_tests,omitempty"`
	ClinicalNotes   []ClinicalNote    `json:"clinical_notes,omitempty"`
	Bill            *Bill             `json:"bill,omitempty"`
}

// Prescription represents a drug prescription parsed from notes
type Prescription struct {
	ID         string    `json:"id" db:"id"`
	VisitID    string    `json:"visit_id" db:"visit_id"`
	DrugName   string    `json:"drug_name" db:"drug_name"`
	Dosage     string    `json:"dosage" db:"dosage"`
	Frequency  string    `json:"frequency" db:"frequency"`
	Duration   string    `json:"duration" db:"duration"`
	Route      string    `json:"route" db:"route"`
	Notes      string    `json:"notes" db:"notes"`
	UnitPrice  float64   `json:"unit_price" db:"unit_price"`
	Quantity   int       `json:"quantity" db:"quantity"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
}

// LabTest represents a lab investigation ordered
type LabTest struct {
	ID          string    `json:"id" db:"id"`
	VisitID     string    `json:"visit_id" db:"visit_id"`
	TestName    string    `json:"test_name" db:"test_name"`
	TestCode    string    `json:"test_code" db:"test_code"`
	Priority    string    `json:"priority" db:"priority"` // routine, urgent, stat
	Notes       string    `json:"notes" db:"notes"`
	Price       float64   `json:"price" db:"price"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}

// ClinicalNote represents structured clinical observations
type ClinicalNote struct {
	ID          string    `json:"id" db:"id"`
	VisitID     string    `json:"visit_id" db:"visit_id"`
	Category    string    `json:"category" db:"category"` // chief_complaint, history, examination, diagnosis, plan
	Content     string    `json:"content" db:"content"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}

// Bill represents the final billing for a visit
type Bill struct {
	ID              string      `json:"id" db:"id"`
	VisitID         string      `json:"visit_id" db:"visit_id"`
	ConsultationFee float64     `json:"consultation_fee" db:"consultation_fee"`
	DrugTotal       float64     `json:"drug_total" db:"drug_total"`
	LabTotal        float64     `json:"lab_total" db:"lab_total"`
	OtherCharges    float64     `json:"other_charges" db:"other_charges"`
	Discount        float64     `json:"discount" db:"discount"`
	TaxAmount       float64     `json:"tax_amount" db:"tax_amount"`
	TotalAmount     float64     `json:"total_amount" db:"total_amount"`
	Status          string      `json:"status" db:"status"` // pending, paid
	CreatedAt       time.Time   `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time   `json:"updated_at" db:"updated_at"`
	LineItems       []BillItem  `json:"line_items,omitempty"`
}

// BillItem is a single line item in the bill
type BillItem struct {
	ID          string  `json:"id" db:"id"`
	BillID      string  `json:"bill_id" db:"bill_id"`
	Category    string  `json:"category" db:"category"` // consultation, drug, lab, other
	Description string  `json:"description" db:"description"`
	Quantity    int     `json:"quantity" db:"quantity"`
	UnitPrice   float64 `json:"unit_price" db:"unit_price"`
	Total       float64 `json:"total" db:"total"`
}

// Doctor represents a physician
type Doctor struct {
	ID           string    `json:"id" db:"id"`
	Name         string    `json:"name" db:"name"`
	Speciality   string    `json:"speciality" db:"speciality"`
	LicenseNo    string    `json:"license_no" db:"license_no"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
}

// AIClassificationRequest is the payload sent to AI service
type AIClassificationRequest struct {
	Text      string `json:"text"`
	PatientID string `json:"patient_id"`
}

// AIClassificationResult is the parsed result from AI
type AIClassificationResult struct {
	Prescriptions []ParsedPrescription `json:"prescriptions"`
	LabTests      []ParsedLabTest      `json:"lab_tests"`
	ClinicalNotes []ParsedClinicalNote `json:"clinical_notes"`
	Confidence    float64              `json:"confidence"`
}

type ParsedPrescription struct {
	DrugName  string  `json:"drug_name"`
	Dosage    string  `json:"dosage"`
	Frequency string  `json:"frequency"`
	Duration  string  `json:"duration"`
	Route     string  `json:"route"`
	Notes     string  `json:"notes"`
}

type ParsedLabTest struct {
	TestName string `json:"test_name"`
	TestCode string `json:"test_code"`
	Priority string `json:"priority"`
	Notes    string `json:"notes"`
}

type ParsedClinicalNote struct {
	Category string `json:"category"`
	Content  string `json:"content"`
}

// CreateVisitRequest is the API request body for creating/updating a visit
type CreateVisitRequest struct {
	PatientID     string `json:"patient_id" binding:"required"`
	DoctorID      string `json:"doctor_id" binding:"required"`
	RawInput      string `json:"raw_input" binding:"required"`
}

// FinalizeVisitRequest is for saving structured parsed data
type FinalizeVisitRequest struct {
	VisitID       string               `json:"visit_id" binding:"required"`
	Prescriptions []ParsedPrescription `json:"prescriptions"`
	LabTests      []ParsedLabTest      `json:"lab_tests"`
	ClinicalNotes []ParsedClinicalNote `json:"clinical_notes"`
}
