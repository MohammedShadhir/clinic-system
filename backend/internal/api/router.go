package api

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter(h *Handler) *gin.Engine {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:5173", "https://clinic-system-weld.vercel.app"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	api := r.Group("/api/v1")
	{
		api.GET("/health", h.HealthCheck)

		// Patients
		api.GET("/patients", h.GetPatients)
		api.POST("/patients", h.CreatePatient)

		// Doctors
		api.GET("/doctors", h.GetDoctors)

		// AI Classification (standalone)
		api.POST("/classify", h.ClassifyNotes)

		// Visits
		api.GET("/visits", h.ListVisits)
		api.POST("/visits", h.CreateVisit)
		api.GET("/visits/:id", h.GetVisit)
		api.POST("/visits/finalize", h.FinalizeVisit)
		api.PATCH("/visits/:id/bill", h.UpdateBillStatus)

		// Catalogs
		api.GET("/catalogs", h.GetCatalogs)
	}

	return r
}
