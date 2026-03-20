package main

import (
	"log"
	"os"

	"github.com/abc-health/clinic-system/internal/api"
	"github.com/abc-health/clinic-system/internal/db"
	"github.com/abc-health/clinic-system/internal/services"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file if present
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Connect to database
	if err := db.Connect(); err != nil {
		log.Fatalf("Database connection failed: %v", err)
	}

	// Run migrations
	if err := db.RunMigrations(); err != nil {
		log.Fatalf("Migrations failed: %v", err)
	}

	// Initialize services
	aiSvc := services.NewAIService()
	visitSvc := services.NewVisitService(aiSvc)

	// Setup router
	h := api.NewHandler(visitSvc, aiSvc)
	r := api.SetupRouter(h)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
