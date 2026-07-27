# StudyBuddy AI

**Your smart AI-powered study planner for university students.**

Live Demo: [https://studybuddy-ai-alpha-roan.vercel.app](https://studybuddy-ai-alpha-roan.vercel.app)

---

## The Problem

University students struggle to manage multiple assignments, deadlines, and study schedules. Most tools are just simple to-do lists that don’t help students plan how to study effectively.

**StudyBuddy AI** solves this problem by helping students organize assignments, track progress, and generate personalized AI study plans — all in one place.

---

## Features

- User Login & Register (Firebase Authentication)
- Add, Edit, Delete Assignments
- Set Due Date, Priority, and Category
- Mark assignments as Completed
- Real-time Stats (Total, Pending, Completed, High Priority)
- AI Study Plan Generator for each assignment
- View and Regenerate AI Study Plans
- Calendar view of due dates
- Pomodoro Focus Timer (15 / 25 / 45 minutes)
- Dark Mode
- Responsive Design

---

## AI Feature

When you click **“Regenerate Plan”** on any assignment, the AI creates a detailed multi-day study plan based on the assignment title and topic.

**Example:**  
For the assignment “calculus topic limits”, the AI generated a complete 4-day study plan to master Limits in Calculus.

**System Prompt used:**
```text
You are an expert study coach. 
Create a clear, practical, day-by-day study plan for the given assignment topic. 
Break the topic into logical steps, include practice recommendations, and make it realistic for a university student.