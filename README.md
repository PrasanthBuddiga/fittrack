# FitTrack 🥗

A full-stack nutrition and fitness tracking web application — built with **vanilla JavaScript** (no frontend framework) as a deliberate engineering choice to demonstrate deep understanding of core web fundamentals including DOM manipulation, Fetch API, async/await, and manual state management.

**🌐 Live Demo:** [prasanthbuddiga.github.io/fittrack](https://prasanthbuddiga.github.io/fittrack/#login)
> *Note: Google and Facebook login are UI placeholders — use username/password to sign in*

---

## 🌟 Why Vanilla JS?

Most developers reach for React or Angular immediately. FitTrack was intentionally built without any frontend framework to demonstrate native browser API proficiency — understanding what frameworks abstract away before relying on them. The backend uses Node.js and Express without an ORM for the same reason.

---

## ✨ Features

### ✅ Implemented
- **User Authentication** — username/password login with session management
- **Food Logging** — search a food database (USDA, Nutritionix, FatSecret APIs) and log consumed items with quantity; macros calculated automatically
- **Date-based Logs** — calendar navigation to view or add food logs for any date
- **Dashboard** — real-time widgets showing today's calorie intake, macros breakdown, and weight progress
- **Profile Management** — view and edit profile details
- **Workout Logging** — log exercises similar to food logging workflow
- **Logout** — confirmation dialog before session end

### 🔒 Planned / In Progress
- Google and Facebook OAuth login
- Premium dashboard widgets (currently shown with lock indicator)
- Recipe management section
- Full workout tracking with progress metrics

---

## 📸 Screenshots

> *(Add screenshots of the login page, dashboard, and food logging screen here)*

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla JavaScript, HTML5, CSS3 |
| Backend | Node.js, Express |
| Database | MongoDB Atlas |
| Food Data APIs | USDA FoodData Central, Nutritionix, FatSecret (OAuth 1.0a), USFDA |
| Hosting (Frontend) | GitHub Pages |
| Hosting (Backend) | Render |
| Auth | Custom session-based authentication |

---

## 🔌 API Integrations

- **USDA FoodData Central** — primary food database for nutritional data
- **Nutritionix** — natural language food search ("2 eggs and toast")
- **FatSecret** — food and recipe database via OAuth 1.0a
- **USFDA** — supplementary food data

---

## 🗺️ Roadmap

- [ ] Google and Facebook OAuth integration
- [ ] Premium dashboard widgets (BMI tracker, weekly trends, hydration)
- [ ] Recipe management and meal planning
- [ ] Full workout progress tracking with charts
- [ ] Mobile responsive design improvements

---

## 👨‍💻 Author

**Prasanth Goud Buddiga**
Senior QA Engineer & Automation Lead

---

## 📄 License
