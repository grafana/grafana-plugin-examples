package plugin

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
)

type ResearchDocument struct {
	Title   string   `json:"title"`
	Authors []string `json:"authors"`
}

func (a *App) HasAccess(req *http.Request, action string) (bool, error) {
	// Retrieve the id token
	idToken := req.Header.Get("X-Grafana-Id")
	if idToken == "" {
		return false, errors.New("id token not found")
	}

	authzClient, err := a.GetAuthZClient(req)
	if err != nil {
		return false, err
	}

	// Check user access
	hasAccess, err := authzClient.HasAccess(req.Context(), idToken, action)
	if err != nil || !hasAccess {
		return false, err
	}
	return true, nil
}

func DenyAccess(w http.ResponseWriter, ctxLogger log.Logger, err error) {
	if err != nil {
		ctxLogger.Error("Error checking access", "error", err)
	}
	http.Error(w, "permission denied", http.StatusForbidden)
}

// handlePapers is an example HTTP GET resource that returns a [ {"title": "reasearch doc title", "authors": ["Dr something"]} ] JSON response.
func (a *App) handlePapers(w http.ResponseWriter, req *http.Request) {
	ctxLogger := log.DefaultLogger.FromContext(req.Context())
	ctxLogger.Info("Research papers handler called")

	if req.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	if hasAccess, err := a.HasAccess(req, "grafana-appwithrbac-app.papers:read"); err != nil || !hasAccess {
		DenyAccess(w, ctxLogger, err)
		return
	}

	w.Header().Add("Content-Type", "application/json")

	res := []ResearchDocument{
		{
			Title:   "Quantum Supremacy: A Path Towards Practical Quantum Computing",
			Authors: []string{"Dr. A", "Dr. B"},
		},
		{
			Title:   "Bioinspired Robotics: Mimicking Nature's Designs for Autonomous Systems",
			Authors: []string{"Dr. C", "Dr. D"},
		},
		{

			Title:   "Neuroplasticity and Learning: Unraveling the Brain's Adaptive Mechanisms",
			Authors: []string{"Dr. A", "Dr. D"},
		},
		{

			Title:   "Augmented Reality in Education: Enhancing Learning Experiences Through Immersive Technology",
			Authors: []string{"Dr. B", "Dr. C"},
		},
		{

			Title:   "Advances in CRISPR Gene Editing: Towards Precision Medicine",
			Authors: []string{"Dr. B", "Dr. C"},
		},
	}

	data, err := json.Marshal(res)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if _, err := w.Write(data); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

type Patent struct {
	Title     string   `json:"title"`
	Inventors []string `json:"inventors"`
}

// handlePatents is an example HTTP GET resource that returns a [ {"title": "patent title", "inventors": ["Dr something"]} ] JSON response.
func (a *App) handlePatents(w http.ResponseWriter, req *http.Request) {
	ctxLogger := log.DefaultLogger.FromContext(req.Context())
	ctxLogger.Info("Patents handler called")

	if req.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	if hasAccess, err := a.HasAccess(req, "grafana-appwithrbac-app.patents:read"); err != nil || !hasAccess {
		DenyAccess(w, ctxLogger, err)
		return
	}

	w.Header().Add("Content-Type", "application/json")

	res := []Patent{
		{
			Title:     "Self-Driving Umbrella: A Weather-Sensing Canopy for Hands-Free Protection",
			Inventors: []string{"Dr. A", "Dr. B"},
		},
		{
			Title:     "Mind-Controlled Virtual Reality: Telepathic Immersion System for Gaming and Beyond",
			Inventors: []string{"Dr. C", "Dr. D"},
		},
		{
			Title:     "Bio-Nano Fusion Patch: Revolutionary Wound Healing Technology Integrating Nanoparticles and Biological Agents",
			Inventors: []string{"Dr. D", "Dr. E"},
		},
		{
			Title:     "Invisibility Cloak: Adaptive Meta-Material Camouflage for Stealth Applications",
			Inventors: []string{"Dr. A", "Dr. C"},
		},
		{
			Title:     "Quantum Energy: Harvesting Subatomic Particles for Unlimited Power Generation",
			Inventors: []string{"Dr. C", "Dr. E"},
		},
		{
			Title:     "Memory Implant: Neural Prosthesis for Enhancing Cognitive Function and Memory Recall",
			Inventors: []string{"Dr. B", "Dr. D"},
		},
	}

	data, err := json.Marshal(res)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if _, err := w.Write(data); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

// registerRoutes takes a *http.ServeMux and registers some HTTP handlers.
func (a *App) registerRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/papers", a.handlePapers)
	mux.HandleFunc("/patents", a.handlePatents)
}
