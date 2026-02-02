# 🌴 MoodEcho AI - Your Warm, Local Mental Health Companion

**MoodEcho** is a full-stack, AI-powered habit tracking application designed to correlate daily habits with emotional well-being.

Unlike traditional trackers that feel robotic and cold, MoodEcho is designed with **"Soul & Local Flavor."** It combines enterprise-grade architecture with a distinct **Southeast Asian AI Persona** (Manglish/Singlish) and a warm, tropical UI to make mental health tracking feel like talking to a supportive friend.

> **Note for Reviewers:**
> This application demonstrates a **Product-Led Engineering** approach. Beyond the technical stack (Java Spring Boot + React), significant effort was placed on **Prompt Engineering** and **UX Design** to solve the "AI empathy gap."
>
> The app is **containerized using Docker** for consistency and scalability.

---

## 🎨 Key Differentiators (UX & Product)

### 1. 🗣️ Culturally Relevant AI Persona
Instead of generic, robotic responses, the AI engine (Gemini 2.5) is engineered to speak in a **warm, supportive Southeast Asian tone**.
* **Input:** "Really sien leh today."
* **AI Response:** "Aiyo, feeling sien ah? Don't worry, steady lah! Chin up, jiayou!"
* *Why?* To create a genuine emotional connection and reduce the stigma of using mental health tools.

### 2. ☀️ Tropical "Resort" Theme
Moved away from standard "SaaS Blue" to a **Tropical Teal & Sunset Orange** color palette.
* **Psychology:** Warmer colors evoke feelings of relaxation, warmth, and positivity, fitting for a wellness application.

### 3. 🧋 Localized Habit Tracking
Features preset habits that resonate with the local lifestyle, such as **"Teh/Kopi"** intake and **"Chill"** sessions, making the tracker feel personalized and grounded in reality.

---

## 🚀 Core Technical Features

* **AI-Powered Analysis**: Uses **Google Gemini 2.5 Flash** with custom prompt engineering to generate mood scores (1-10) and empathetic summaries.
* **Smart Consolidation**: Automatically consolidates unstructured text data (Journal) with structured data (Habits) into a unified database record.
* **Visual Analytics**: Interactive Area Charts (Recharts) to visualize mood trends over time.
* **Responsive Architecture**: A Mobile-First design using Tailwind CSS that works perfectly on desktop and mobile devices.
* **Resilient Backend**: Implements graceful degradation—if AI services fail, user data is safely preserved without crashing the flow.

---

## 🛠️ Tech Stack

### Frontend
* **Framework**: React 18 (TypeScript) + Vite
* **Styling**: Tailwind CSS (Custom "Tropical" Config)
* **Visualization**: Recharts
* **Icons**: Lucide React

### Backend
* **Core**: Java (JDK 17), Spring Boot 3.5
* **Data**: Spring Data JPA, Hibernate
* **Security**: Spring Security (BCrypt), JWT (JSON Web Token)
* **AI Integration**: Google Gemini API (`gemini-2.5-flash`) via `RestClient`

### Infrastructure
* **Database**: PostgreSQL 15
* **DevOps**: Docker, Docker Compose

---

## 🏗️ Architecture Highlights

### 1. Prompt Engineering as a Feature
The `AiService` doesn't just call an API; it injects a specific "System Persona" into the context window. This ensures the AI adheres to the "supportive local friend" character while strictly outputting valid JSON for the frontend to parse.

### 2. Transactional Integrity
Implemented a structured **Controller-Service-Repository** pattern. User journals and habit logs are saved within a single transaction (`@Transactional`) to ensure data consistency.

### 3. Graceful Degradation
I implemented a `try-catch` fallback mechanism. If the AI API experiences latency or downtime, the system logs the error but saves the user's entry with a default status, ensuring **zero data loss** for the user.

---

## 📦 How to Run (Docker - Recommended)

Pre-requisites: Docker Desktop installed.

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/kzxian1201/MoodEcho.git](https://github.com/kzxian1201/MoodEcho.git)
    cd MoodEcho
    ```

2.  **Start the Application**
    Run the following command in the root directory. This will build the Backend (Java), Frontend (Node/Nginx), and Database (Postgres) containers.
    ```bash
    docker-compose up --build
    ```

3.  **Access the App**
    * **Frontend**: `http://localhost:5173`
    * **Backend API**: `http://localhost:8081/api/entries`

---

## 🔧 How to Run (Manual Setup)

If you prefer running without Docker:

**1. Database**
* Ensure PostgreSQL is running on port `5432`.
* Create a database named `moodecho_db`.
* Update `backend/src/main/resources/application.properties` with your DB credentials.

**2. Backend**
```bash
cd backend
# Make sure you have your GOOGLE_API_KEY set or in application.properties
./mvnw spring-boot:run
```

**3. Frontend**
```bash
cd frontend
npm install
npm run dev
```

---

## 🧗 Technical Challenges & Solutions

### 1. The "Strict JSON vs. Creative Persona" Conflict
**Challenge:** Instructing the Gemini AI to speak in a colloquial "Manglish/Singlish" tone (e.g., using words like "lah", "sien") often caused the model to output unstructured text, breaking the JSON parser in the backend.
**Solution:** I implemented a **"System-User-Format"** prompting strategy. I explicitly separated the *persona instructions* ("Speak like a local friend") from the *formatting instructions* ("Return ONLY raw JSON"). I also added a resilience layer in Java using Jackson `ObjectMapper` to sanitize the AI response before parsing.

### 2. Handling High-Frequency UI Updates
**Challenge:** The layout relies on CSS Grid for responsiveness. However, the `Recharts` visualization library would sometimes attempt to render before the parent container's dimensions were fully calculated by the DOM, causing console warnings and layout shifts.
**Solution:** I engineered a custom hook and a layout-stable rendering flow. By forcing a micro-delay in the chart's mounting phase and ensuring explicit container dimensions, I eliminated the race condition, ensuring a buttery-smooth 60fps experience.

---

## 🔮 Future Improvements

If I had more time, here is what I would build next:

* **🎙️ Voice Journaling (Speech-to-Text)**
    * **Concept:** Integrate the Web Speech API so users can literally "rant" to the app.
    * **Why:** It fits the "Therapy/Venting" use case perfectly. Talking is faster than typing when you are emotional.

* **📊 Long-Term Sentiment Trends**
    * **Concept:** Add weekly and monthly PDF reports generated by AI.
    * **Why:** To help users identify patterns (e.g., "You tend to feel anxious every Sunday night").

* **🔐 Biometric Login**
    * **Concept:** Implement WebAuthn for Fingerprint/FaceID login.
    * **Why:** Journaling is private. Biometrics adds a layer of seamless security on mobile devices.