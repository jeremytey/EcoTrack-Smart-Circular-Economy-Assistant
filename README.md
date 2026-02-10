# EcoTrack 
### Smart Circular Economy Assistant

EcoTrack is a mobile application that helps users make better recycling decisions in real time. By simply scanning an item with their phone camera, users can instantly know whether it is recyclable, how to dispose of it correctly, and where the nearest recycling facility is located.
This project was built as a hackathon MVP to demonstrate how AI can reduce confusion around waste disposal and support sustainable urban living in Malaysia.

---

##  Problem

Many people want to recycle responsibly but often face uncertainty:
- Is this item recyclable?
- How should it be prepared before disposal?
- Where can it be recycled nearby?

This confusion leads to recyclable materials being discarded incorrectly, especially composite packaging and e-waste. Existing solutions are fragmented, unclear, or require prior knowledge.

---

##  Solution

EcoTrack provides **fast, decision-focused assistance at the moment of disposal**.

Users simply:
1. Open the app
2. Scan an item using the camera
3. Receive a clear action card showing:
   - Item identification
   - Recyclability status
   - Simple disposal instructions
   - Nearest recycling location

No chatbots. No manual searching. No complex onboarding.

---

##  AI Integration

EcoTrack uses **Google Gemini (Multimodal AI)** to analyze images of waste items.

The AI:
- Identifies the item and material type
- Determines recyclability based on Malaysian context
- Outputs structured JSON for deterministic UI rendering

AI is used as a **decision engine**, not a novelty feature.

---

##  Tech Stack

**Frontend**
- Flutter (Mobile App)
- Camera Plugin
- Google Maps API

**Backend**
- Firebase Cloud Functions (Node.js)
- REST API endpoint (`POST /scan`)
- Gemini API (Image + Text)

**Infrastructure**
- Firebase
- Google AI Studio
- Google Maps Platform

---

##  System Architecture (High-Level)

1. User scans an item using the mobile camera
2. Image is sent to a Firebase Cloud Function
3. Gemini analyzes the image and returns structured JSON
4. Backend sends processed data to the frontend
5. App displays a clear action card and map location

---

##  SDG Alignment

- **SDG 11 – Sustainable Cities and Communities**
  - Improves access to proper waste disposal information
- **SDG 13 – Climate Action**
  - Reduces landfill waste through better recycling behavior


##  Demo Flow

1. Open EcoTrack
2. Scan a recyclable item (e.g. plastic bottle or Tetra Pak)
3. AI identifies the item and recyclability
4. App displays disposal instructions
5. Map shows nearest recycling point

Designed to be understood by judges in under 60 seconds.

---

##  Future Roadmap

**Short-Term**
- Expand supported item categories
- Improve AI confidence scoring

**Mid-Term**
- Community recycling impact tracking
- Local council partnerships

**Long-Term**
- Regional expansion
- Smart city waste analytics


---

## 📄 Notes

This project is a hackathon MVP and prioritizes clarity, feasibility, and real-world relevance over production completeness.
