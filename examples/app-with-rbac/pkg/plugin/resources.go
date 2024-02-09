package plugin

import (
	"encoding/json"
	"net/http"

	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
)

type ResearchDocument struct {
	Title   string   `json:"title"`
	Authors []string `json:"authors"`
}

// handlePapers is an example HTTP GET resource that returns a [ {"title": "reasearch doc title", "authors": ["Dr something"]} ] JSON response.
func (a *App) handlePapers(w http.ResponseWriter, req *http.Request) {
	ctxLogger := log.DefaultLogger.FromContext(req.Context())
	ctxLogger.Info("Research papers handler called")

	if req.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	idToken := req.Header.Get("X-Grafana-Id")
	if idToken == "" {
		ctxLogger.Error("Missing ID token, make sure you have enabled idForwarding in your Grafana config file.")
		http.Error(w, "id token not found", http.StatusUnauthorized)
		return
	}

	hasAccess, err := a.permissionClient.HasAccess(req.Context(), idToken, "grafana-appwithrbac-app.papers:read", "")
	if err != nil || !hasAccess {
		if err != nil {
			ctxLogger.Error("Error checking access", "error", err)
		}
		http.Error(w, "permission denied", http.StatusForbidden)
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

	idToken := req.Header.Get("X-Grafana-Id")
	if idToken == "" {
		ctxLogger.Error("Missing ID token")
		http.Error(w, "id token not found", http.StatusUnauthorized)
		return
	}

	hasAccess, err := a.permissionClient.HasAccess(req.Context(), idToken, "grafana-appwithrbac-app.patents:read", "")
	if err != nil || !hasAccess {
		if err != nil {
			ctxLogger.Error("Error checking access", "error", err)
		}
		http.Error(w, "permission denied", http.StatusForbidden)
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
