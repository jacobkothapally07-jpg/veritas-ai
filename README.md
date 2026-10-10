# 🛡️ VERITAS AI
> **Autonomous Multi-Engine Deep-Tech Due Diligence & Patent Reality Checker**  
> *Submitted to the **SerpApi India Hackathon 2026** — **Track 1: AI Agents***  
> *Core Innovation:* **Cross-Engine Forensic Verification (Patents vs. Scholar vs. News vs. Web)**

---

## 🎥 Full-HD Video Demonstration
> **Complete forensic walkthrough & product demonstration:**  
> **Video File:** [`VERITAS_NEXUS_DEMO.mp4`](VERITAS_NEXUS_DEMO.mp4) (Full HD `1920x1080` with studio neural narration)  
> *Showcases: Naval Cream executive UI, 6-module forensic sidebar, ClaimShield StatsBar, Contradiction Engine, Grill the Founder suite, Prior-Art Collision Radar, and 1-click Investor Dossier export.*

---

## 🎯 Executive Summary
Startups and tech corporations constantly overhype unproven claims: *"We created a room-temperature superconductor"*, *"Our battery separator eliminates dendrites completely"*, *"Our humanoid robot is 100% autonomous"*. 

Venture capitalists, patent attorneys, and enterprise R&D directors lose billions because they lack the time and PhD specialization to audit every pitch.

**Veritas AI is an autonomous adversarial due-diligence agent.** When given a marketing claim or technology pitch, Veritas AI does **not** rely on standard web search links. Instead, it dispatches concurrent queries across **4 distinct SerpApi specialized search engines**:
1. **Google Patents Engine (`google_patents`):** Audits legal claims, assignees, granted status, and unrevealed mechanical limitations.
2. **Google Scholar Engine (`google_scholar`):** Audits peer-reviewed physics/chemistry literature, citation velocity, and academic replication studies.
3. **Google News Engine (`google_news`):** Audits investigative journalism, short-seller reports, SEC filings, and corporate executive turnover.
4. **Google Web Engine (`google`):** Audits developer teardowns and engineering forums.

Veritas AI's **Contradiction Engine** reconciles the marketing claims against the legal and scientific disclosures, producing an institutional-grade **Hype vs. Reality Score (0–100)**, an **IP Moat Rating**, a **Contradiction Matrix**, and a downloadable **Executive Due Diligence Dossier**.

---

## 🏛️ System Architecture

```
                          ┌───────────────────────────┐
                          │   USER PITCH / PR CLAIM   │
                          │   "Solid-State Battery"   │
                          └─────────────┬─────────────┘
                                        │
                                        ▼
                 CONCURRENT SERPAPI MULTI-ENGINE DISPATCHER
                 (Official SerpApi Python / Async SDK)
     ┌──────────────────┬───────────────────┬───────────────────┐
     ▼                  ▼                   ▼                   ▼
1. GOOGLE PATENTS  2. GOOGLE SCHOLAR   3. GOOGLE NEWS     4. GOOGLE ORGANIC
  `engine:           `engine:            `engine:           `engine:
  google_patents`    google_scholar`     google_news`       google`
  • Claims & Priors  • Citations/Papers  • Whistleblowers   • Teardowns
  • Assignees        • DOI Journals      • Regulatory       • Discussions
     └──────────────────┼───────────────────┼───────────────────┘
                        │
                        ▼
            NORMALIZED FORENSIC EVIDENCE HUD
                        │
                        ▼
            CONTRADICTION & RECONCILIATION AGENT
            ├── Discrepancy Matrix (Claim vs Legal Disclosures)
            ├── Hype Index vs Reality Index (0–100)
            ├── Patent Moat Strength (AAA, A-, BBB, D)
            ├── NASA Technology Readiness Level (TRL 1–9)
            └── Chronological Evolution Timeline (Paper ➔ Patent ➔ PR)
                        │
                        ▼
        INSTITUTIONAL DUE DILIGENCE DOSSIER EXPORT (.MD)
```

---

## 🌟 Why This Represents "Meaningful SerpApi Usage"
According to Hackathon Rule 2.3:
> *"SerpApi must make a material contribution to the submitted project's functionality. Adding an isolated or cosmetic API call solely to meet eligibility requirements is insufficient."*

Veritas AI **cannot exist without SerpApi**:
* Standard web scrapers cannot reliably extract structured metadata from Google Patents (patent IDs, assignees, legal status) or Google Scholar (citation counts, BibTeX, authors).
* Veritas AI demonstrates the full breadth of SerpApi's value proposition by treating multiple niche search engines as an ensemble truth-verification committee.

---

## 🚀 Quick Launch (1 Command)

### Prerequisites:
- Python 3.10+
- Node.js 18+

### Single Command Launch:
```bash
chmod +x run.sh
./run.sh
```

### Endpoints:
* **Interactive Frontend Dashboard:** `http://localhost:5173`
* **FastAPI Backend Server:** `http://localhost:8000`
* **OpenAPI Interactive Documentation:** `http://localhost:8000/docs`

---

## 🧪 Curated High-Stakes Audit Scenarios (1-Click Evaluation)
Veritas AI comes pre-loaded with 4 real-world deep-tech verification cases for immediate judge evaluation:
1. **QuantumScape Solid-State Battery:** Audits claims of dendrite-free 15-min fast charging vs. patent disclosures mandating heavy 3–5 atm compressive frames and low-temperature impedance spikes.
2. **LK-99 / PCPOSOS Superconductor:** Audits claims of room-temperature zero resistance vs. Max Planck Institute papers revealing Cu2S phase transition artifacts and rejected patent filings.
3. **Neuralink N1 Telepathy BCI:** Audits claims of permanent 1024-channel recording vs. 85% thread retraction reports and cortical micromotion shear papers.
4. **Figure AI Humanoid Autonomy:** Audits claims of zero-shot warehouse manipulation vs. cycloidal actuator thermal dissipation limits and teleoperation intervention ratios.

---

## 📄 License
MIT License. Built for the **SerpApi India Hackathon 2026**.
