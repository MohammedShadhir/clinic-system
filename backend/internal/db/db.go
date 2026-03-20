package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/lib/pq"
)

var DB *sql.DB

// Connect initializes the PostgreSQL database connection
func Connect() error {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		getEnv("DB_HOST", "localhost"),
		getEnv("DB_PORT", "5432"),
		getEnv("DB_USER", "postgres"),
		getEnv("DB_PASSWORD", "password"),
		getEnv("DB_NAME", "clinic_db"),
		getEnv("DB_SSLMODE", "disable"),
	)

	var err error
	DB, err = sql.Open("postgres", dsn)
	if err != nil {
		return fmt.Errorf("failed to open db: %w", err)
	}

	DB.SetMaxOpenConns(25)
	DB.SetMaxIdleConns(5)
	DB.SetConnMaxLifetime(5 * time.Minute)

	if err = DB.Ping(); err != nil {
		return fmt.Errorf("failed to ping db: %w", err)
	}

	log.Println("✅ Database connected successfully")
	return nil
}

// RunMigrations creates tables if they don't exist
func RunMigrations() error {
	migrations := []string{
		`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,

		`CREATE TABLE IF NOT EXISTS doctors (
			id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			name VARCHAR(200) NOT NULL,
			speciality VARCHAR(100),
			license_no VARCHAR(50) UNIQUE,
			created_at TIMESTAMPTZ DEFAULT NOW()
		)`,

		`CREATE TABLE IF NOT EXISTS patients (
			id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			name VARCHAR(200) NOT NULL,
			date_of_birth DATE,
			gender VARCHAR(10),
			phone VARCHAR(20),
			email VARCHAR(100),
			created_at TIMESTAMPTZ DEFAULT NOW(),
			updated_at TIMESTAMPTZ DEFAULT NOW()
		)`,

		`CREATE TABLE IF NOT EXISTS visits (
			id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
			doctor_id UUID NOT NULL REFERENCES doctors(id),
			raw_input TEXT,
			visit_date TIMESTAMPTZ DEFAULT NOW(),
			status VARCHAR(20) DEFAULT 'draft',
			created_at TIMESTAMPTZ DEFAULT NOW(),
			updated_at TIMESTAMPTZ DEFAULT NOW()
		)`,

		`CREATE TABLE IF NOT EXISTS prescriptions (
			id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
			drug_name VARCHAR(200) NOT NULL,
			dosage VARCHAR(100),
			frequency VARCHAR(100),
			duration VARCHAR(100),
			route VARCHAR(50),
			notes TEXT,
			unit_price DECIMAL(10,2) DEFAULT 0,
			quantity INT DEFAULT 1,
			created_at TIMESTAMPTZ DEFAULT NOW()
		)`,

		`CREATE TABLE IF NOT EXISTS lab_tests (
			id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
			test_name VARCHAR(200) NOT NULL,
			test_code VARCHAR(50),
			priority VARCHAR(20) DEFAULT 'routine',
			notes TEXT,
			price DECIMAL(10,2) DEFAULT 0,
			created_at TIMESTAMPTZ DEFAULT NOW()
		)`,

		`CREATE TABLE IF NOT EXISTS clinical_notes (
			id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
			category VARCHAR(50) NOT NULL,
			content TEXT NOT NULL,
			created_at TIMESTAMPTZ DEFAULT NOW()
		)`,

		`CREATE TABLE IF NOT EXISTS bills (
			id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			visit_id UUID NOT NULL UNIQUE REFERENCES visits(id) ON DELETE CASCADE,
			consultation_fee DECIMAL(10,2) DEFAULT 0,
			drug_total DECIMAL(10,2) DEFAULT 0,
			lab_total DECIMAL(10,2) DEFAULT 0,
			other_charges DECIMAL(10,2) DEFAULT 0,
			discount DECIMAL(10,2) DEFAULT 0,
			tax_amount DECIMAL(10,2) DEFAULT 0,
			total_amount DECIMAL(10,2) DEFAULT 0,
			status VARCHAR(20) DEFAULT 'pending',
			created_at TIMESTAMPTZ DEFAULT NOW(),
			updated_at TIMESTAMPTZ DEFAULT NOW()
		)`,

		`CREATE TABLE IF NOT EXISTS bill_items (
			id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
			category VARCHAR(50) NOT NULL,
			description VARCHAR(300) NOT NULL,
			quantity INT DEFAULT 1,
			unit_price DECIMAL(10,2) DEFAULT 0,
			total DECIMAL(10,2) DEFAULT 0
		)`,

		`CREATE TABLE IF NOT EXISTS drug_catalog (
			id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			name VARCHAR(200) NOT NULL,
			generic_name VARCHAR(200),
			unit_price DECIMAL(10,2) DEFAULT 0,
			category VARCHAR(100)
		)`,

		`CREATE TABLE IF NOT EXISTS test_catalog (
			id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			test_name VARCHAR(200) NOT NULL,
			test_code VARCHAR(50) UNIQUE,
			price DECIMAL(10,2) DEFAULT 0,
			category VARCHAR(100)
		)`,

		// Seed a default doctor
		`INSERT INTO doctors (id, name, speciality, license_no)
		 VALUES ('00000000-0000-0000-0000-000000000001', 'Dr. Sarah Chen', 'General Practice', 'GP-001')
		 ON CONFLICT (license_no) DO NOTHING`,

		// Seed drug catalog
		`INSERT INTO drug_catalog (name, generic_name, unit_price, category) VALUES
		 ('Amoxicillin 500mg', 'Amoxicillin', 2.50, 'Antibiotic'),
		 ('Paracetamol 500mg', 'Paracetamol', 0.50, 'Analgesic'),
		 ('Ibuprofen 400mg', 'Ibuprofen', 1.00, 'NSAID'),
		 ('Metformin 500mg', 'Metformin', 1.50, 'Antidiabetic'),
		 ('Amlodipine 5mg', 'Amlodipine', 3.00, 'Antihypertensive'),
		 ('Omeprazole 20mg', 'Omeprazole', 2.00, 'PPI'),
		 ('Salbutamol Inhaler', 'Salbutamol', 8.00, 'Bronchodilator'),
		 ('Cetirizine 10mg', 'Cetirizine', 1.20, 'Antihistamine'),
		 ('Azithromycin 500mg', 'Azithromycin', 4.50, 'Antibiotic'),
		 ('Atorvastatin 20mg', 'Atorvastatin', 3.50, 'Statin')
		 ON CONFLICT DO NOTHING`,

		// Seed test catalog
		`INSERT INTO test_catalog (test_name, test_code, price, category) VALUES
		 ('Complete Blood Count', 'CBC', 15.00, 'Hematology'),
		 ('Fasting Blood Sugar', 'FBS', 10.00, 'Biochemistry'),
		 ('HbA1c', 'HBA1C', 25.00, 'Biochemistry'),
		 ('Lipid Profile', 'LIPID', 20.00, 'Biochemistry'),
		 ('Liver Function Test', 'LFT', 30.00, 'Biochemistry'),
		 ('Kidney Function Test', 'KFT', 30.00, 'Biochemistry'),
		 ('Thyroid Function Test', 'TFT', 35.00, 'Endocrinology'),
		 ('Urine Full Report', 'UFR', 8.00, 'Urinalysis'),
		 ('Chest X-Ray', 'CXR', 40.00, 'Radiology'),
		 ('ECG', 'ECG', 25.00, 'Cardiology'),
		 ('Blood Urea Nitrogen', 'BUN', 12.00, 'Biochemistry'),
		 ('Serum Creatinine', 'CREAT', 10.00, 'Biochemistry'),
		 ('Urinalysis', 'UA', 8.00, 'Urinalysis'),
		 ('Blood Culture', 'BCULTURE', 45.00, 'Microbiology'),
		 ('COVID-19 PCR', 'COVID_PCR', 60.00, 'Virology')
		 ON CONFLICT DO NOTHING`,
	}

	for _, m := range migrations {
		if _, err := DB.Exec(m); err != nil {
			return fmt.Errorf("migration failed: %w\nSQL: %s", err, m)
		}
	}

	log.Println("✅ Migrations completed successfully")
	return nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
