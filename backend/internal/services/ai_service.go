package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/abc-health/clinic-system/internal/models"
)

type AIService struct {
	apiKey string
	client *http.Client
}

func NewAIService() *AIService {
	return &AIService{
		apiKey: os.Getenv("GEMINI_API_KEY"),
		client: &http.Client{},
	}
}

type geminiRequest struct {
	Contents []geminiContent `json:"contents"`
}

type geminiContent struct {
	Parts []geminiPart `json:"parts"`
}

type geminiPart struct {
	Text string `json:"text"`
}

type geminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
}

func (s *AIService) ClassifyNotes(text string) (*models.AIClassificationResult, error) {
	prompt := `You are a clinical NLP assistant that helps parse doctor's notes into structured medical data.
Analyze the provided clinical text and extract information into three categories.

Respond ONLY with a valid JSON object in this exact format with no extra text before or after:
{
  "prescriptions": [
    {
      "drug_name": "Drug name and strength",
      "dosage": "Amount per dose",
      "frequency": "How often (e.g., TID, BD, OD)",
      "duration": "How long (e.g., 5 days, 1 week)",
      "route": "Route of administration (oral, IV, topical, inhaled)",
      "notes": "Any special instructions"
    }
  ],
  "lab_tests": [
    {
      "test_name": "Full test name",
      "test_code": "Standard code if known (e.g., CBC, FBS, LFT)",
      "priority": "routine|urgent|stat",
      "notes": "Any special instructions"
    }
  ],
  "clinical_notes": [
    {
      "category": "chief_complaint|history|examination|diagnosis|plan",
      "content": "The note content"
    }
  ],
  "confidence": 0.95
}

Rules:
- Extract ALL medications mentioned
- If dosage or frequency is not specified, leave as empty string
- For lab tests, infer standard codes when possible (CBC, FBS, LFT, KFT, UFR, CXR, ECG, TFT, HBA1C, LIPID)
- Return empty arrays if no items found in a category
- Return ONLY the JSON object, absolutely no other text

Clinical text to analyze:
` + text

	reqBody := geminiRequest{
		Contents: []geminiContent{
			{
				Parts: []geminiPart{
					{Text: prompt},
				},
			},
		},
	}

	payload, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	// Current working Gemini models (updated March 2026)
	modelsToTry := []string{
		"gemini-2.0-flash",
		"gemini-2.0-flash-lite",
		"gemini-3-flash-preview",
		"gemini-1.5-flash",
		"gemini-1.5-flash-001",
	}

	var lastErr error
	for _, modelName := range modelsToTry {
		log.Printf("Trying Gemini model: %s", modelName)

		url := fmt.Sprintf(
			"https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
			modelName,
			s.apiKey,
		)

		req, err := http.NewRequest("POST", url, bytes.NewBuffer(payload))
		if err != nil {
			lastErr = err
			continue
		}
		req.Header.Set("Content-Type", "application/json")

		resp, err := s.client.Do(req)
		if err != nil {
			lastErr = err
			continue
		}

		body, err := io.ReadAll(resp.Body)
		resp.Body.Close()
		if err != nil {
			lastErr = err
			continue
		}

		// If model not found, try next one
		if resp.StatusCode == 404 {
			log.Printf("Model %s not found, trying next...", modelName)
			lastErr = fmt.Errorf("model %s not found", modelName)
			continue
		}

		if resp.StatusCode != 200 {
			lastErr = fmt.Errorf("API error %d: %s", resp.StatusCode, string(body))
			log.Printf("Model %s error %d, trying next...", modelName, resp.StatusCode)
			continue
		}

		// Parse the response
		var geminiResp geminiResponse
		if err := json.Unmarshal(body, &geminiResp); err != nil {
			lastErr = fmt.Errorf("failed to parse response: %w", err)
			continue
		}

		if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
			lastErr = fmt.Errorf("empty response from Gemini model %s", modelName)
			continue
		}

		rawJSON := strings.TrimSpace(geminiResp.Candidates[0].Content.Parts[0].Text)

		// Strip markdown code fences if present
		rawJSON = strings.TrimPrefix(rawJSON, "```json")
		rawJSON = strings.TrimPrefix(rawJSON, "```")
		rawJSON = strings.TrimSuffix(rawJSON, "```")
		rawJSON = strings.TrimSpace(rawJSON)

		log.Printf("Gemini model %s responded successfully", modelName)

		var result models.AIClassificationResult
		if err := json.Unmarshal([]byte(rawJSON), &result); err != nil {
			lastErr = fmt.Errorf("failed to parse AI JSON from model %s: %w", modelName, err)
			continue
		}

		// Success!
		return &result, nil
	}

	return nil, fmt.Errorf("all Gemini models failed. Last error: %w", lastErr)
}
