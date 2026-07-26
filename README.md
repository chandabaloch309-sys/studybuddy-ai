# StudyBuddy AI

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)

**AI-powered study planner for university students**

Manage assignments, track academic progress, and generate personalized study plans using Google Gemini AI.

🔗 **Live Demo:** [https://studybuddy-ai-alpha-roan.vercel.app](https://studybuddy-ai-alpha-roan.vercel.app)

---

## Features

- Secure authentication with Firebase (Login & Register)
- Personal dashboard with live statistics
- Full CRUD for assignments (Create, Read, Update, Delete)
- Assignment status management (Pending / Completed)
- Priority levels (High / Medium / Low)
- AI Study Assistant powered by Google Gemini
- AI-generated personalized study plans
- Dark mode support
- Fully responsive design

---

## Tech Stack

| Layer                | Technology                      |
|----------------------|---------------------------------|
| Frontend             | Next.js, React, Tailwind CSS    |
| Authentication       | Firebase Authentication         |
| Database             | Cloud Firestore                 |
| Artificial Intelligence | Google Gemini API            |
| Deployment           | Vercel                          |
| Version Control      | GitHub                          |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm
- Firebase project
- Google Gemini API key

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd studybuddy-ai

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local   # or create .env.local manually