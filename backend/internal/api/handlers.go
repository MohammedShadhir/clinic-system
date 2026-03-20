package api

import (
	"net/http"

	"github.com/abc-health/clinic-system/internal/db"
	"github.com/abc-health/clinic-system/internal/models"
	"github.com/abc-health/clinic-system/internal/services"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	visitSvc *services.VisitService
	aiSvc    *services.AIService
}

func NewHandler(visitSvc *services.VisitService, aiSvc *services.AIService) *Handler {
	return &Handler{visitSvc: visitSvc, aiSvc: aiSvc}
}

func (h *Handler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "clinic-system"})
}

func (h *Handler) GetPatients(c *gin.Context) {
	patients, err := services.GetPatients()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if patients == nil {
		patients = []models.Patient{}
	}
	c.JSON(http.StatusOK, patients)
}

func (h *Handler) CreatePatient(c *gin.Context) {
	var p models.Patient
	if err := c.ShouldBindJSON(&p); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	created, err := services.CreatePatient(&p)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, created)
}

func (h *Handler) GetDoctors(c *gin.Context) {
	doctors, err := services.GetDoctors()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if doctors == nil {
		doctors = []models.Doctor{}
	}
	c.JSON(http.StatusOK, doctors)
}

func (h *Handler) ClassifyNotes(c *gin.Context) {
	var req struct {
		Text string `json:"text" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	result, err := h.aiSvc.ClassifyNotes(req.Text)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, result)
}

func (h *Handler) CreateVisit(c *gin.Context) {
	var req models.CreateVisitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	visit, aiResult, err := h.visitSvc.CreateVisit(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"visit": visit, "ai_result": aiResult})
}

func (h *Handler) FinalizeVisit(c *gin.Context) {
	var req models.FinalizeVisitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	visit, err := h.visitSvc.FinalizeVisit(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, visit)
}

func (h *Handler) GetVisit(c *gin.Context) {
	id := c.Param("id")
	visit, err := h.visitSvc.GetVisit(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, visit)
}

func (h *Handler) ListVisits(c *gin.Context) {
	visits, err := h.visitSvc.ListVisits()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if visits == nil {
		visits = []models.Visit{}
	}
	c.JSON(http.StatusOK, visits)
}

func (h *Handler) UpdateBillStatus(c *gin.Context) {
	visitID := c.Param("id")
	var req struct {
		Status string `json:"status"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.Status != "paid" && req.Status != "pending" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "status must be paid or pending"})
		return
	}
	_, err := db.DB.Exec(`UPDATE bills SET status=$1, updated_at=NOW() WHERE visit_id=$2`, req.Status, visitID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "bill status updated", "status": req.Status})
}

func (h *Handler) GetCatalogs(c *gin.Context) {
	drugs := []map[string]interface{}{}
	tests := []map[string]interface{}{}

	rows, _ := db.DB.Query(`SELECT name, generic_name, unit_price, category FROM drug_catalog ORDER BY name`)
	if rows != nil {
		defer rows.Close()
		for rows.Next() {
			var name, generic, category string
			var price float64
			rows.Scan(&name, &generic, &price, &category)
			drugs = append(drugs, map[string]interface{}{
				"name": name, "generic_name": generic, "unit_price": price, "category": category,
			})
		}
	}

	testRows, _ := db.DB.Query(`SELECT test_name, test_code, price, category FROM test_catalog ORDER BY test_name`)
	if testRows != nil {
		defer testRows.Close()
		for testRows.Next() {
			var name, code, category string
			var price float64
			testRows.Scan(&name, &code, &price, &category)
			tests = append(tests, map[string]interface{}{
				"test_name": name, "test_code": code, "price": price, "category": category,
			})
		}
	}

	c.JSON(http.StatusOK, gin.H{"drugs": drugs, "tests": tests})
}
