# 🧠 Project Plan — AI-Powered Quiz Generator

## 🎯 Overview

Build a web platform that allows users to generate quizzes instantly from content (YouTube video, document, blog post, topic entered by user etc.) and optionally share them publicly to take the quiz. It also includes features like quiz history, Google Form export, leaderboard and public/private toggles.

---

## ✅ Core USP

> “Create a quiz instantly from any topic — YouTube video, blog, or document — and test yourself or challenge others.”

---

## 🔧 MVP Features

### 1. 📥 Content-Based Quiz Generation

- Input Types:
  - YouTube URL
  - Blog post URL
  - Uploaded PDF/DOC/Text
  - user's topic (example : world war 2, react JS etc)
- Output:
  - Multiple-choice quiz (start with 5–10 questions - decided by user)
  - Auto-generated using LLM (e.g. GPT-4)
  - Option to edit questions before saving

---

### 2. 🎮 Quiz Modes

| Mode           | Description                                     |
|----------------|-------------------------------------------------|
| Private Quiz   | For personal practice — visible only to creator |
| Public Quiz    | Anyone with the link can take the quiz          |

- Users can toggle between **private** and **public** at creation time.

---

### 3. 📊 Leaderboard (for Public Quizzes)

- Unique shareable quiz link
- Leaderboard tracks:
  - Nickname
  - Score
  - Time taken
- Sorting: Score ↓ then Time ↑
- Basic input: "Enter your nickname before starting"

---

### 4. 📁 Quiz History (User Side)

- Track:
  - Quiz title
  - Date created
  - Number of attempts (if public) - creator can decide if allow to multiple attempt or not
  - Export/download option
- Storage via local/session or user account (future)

---

### 5. 📤 Export to Google Form

- Button to export generated quiz
- Output:
  - CSV
  - Pre-filled Google Form link (using Forms API or template generator)

---

## 🧱 Tech Stack (Suggested)

| Layer         | Tools                                               |
|---------------|-----------------------------------------------------|
| Frontend      | Next.js, Tailwind CSS, ShadCN, Lucide Icons         |
| Backend       | Supabase (PostgreSQL + Auth + Realtime)             |
| AI Quiz Gen   | Cluade models                                       |
| Google Forms  | API integration                                     |
| Hosting       | Vercel                                              |

---

## 🧪 User Flow

### 🎯 Creator
1. Paste URL / Upload File
2. Select number of questions and difficulty of the quiz
3. Generate quiz
4. (Optional) Edit questions
5. Choose: Public or Private
6. Save and:
   - Take it
   - Share it (if public)
   - Export to Google Form
   - View history

### 🎯 Player (Visitor)
1. Open shared quiz link
2. Enter nickname
3. Take quiz
4. View results + leaderboard placement

---

## 🏁 Next Steps

1. ✅ Finalize quiz generation prompt and logic
2. ✅ Design minimal clean UI mockups
3. 🚧 Implement quiz creation flow (front + backend)
4. 🚧 Build leaderboard logic + sharing page
5. 🚧 Add history + export functionality
6. 🚀 Launch MVP and get feedback

---

Name of the app is - "quizito"

---

## 📢 Tagline Ideas

> “Turn any topic into a quiz — instantly.”  
> “Don’t just read it. Quiz it.”  
> “Learn faster. Test smarter.”  
> “From YouTube to Quiz in seconds.”
---
