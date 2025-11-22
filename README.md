
# 🎯 Recroot.AI – AI Interview Practice Partner (With Voice Agent)

Recroot.AI is an AI-based **interview practice companion** that helps users prepare for job interviews through simulated interview sessions. Users can select a role or skill, answer AI-generated questions, and receive instant feedback on their performance. The platform also supports **voice-based interviews** through Vapi, offering a more realistic experience.

The application is built using **Next.js**, **Tailwind CSS**, **Supabase**, a **Node.js backend**, and **Razorpay** for payment handling. It is ideal for:

- Students preparing for college placements  
- Individuals aiming to practice technical interviews  
- Anyone wanting structured interview feedback before real interviews  

---

## 🚀 Features

- **Secure Login & User Accounts**
  - Authentication handled by **Supabase**
  - Stored attempts and progress linked to logged-in users

- **AI-Driven Interview Sessions**
  - Questions generated based on selected role or domain
  - Real-time practice with evaluation

- **📊 Performance Feedback**
  - AI-generated scoring on communication, technical ability, reasoning, etc.

- **🎙️ Voice Interview Mode (Vapi)**
  - Conduct interviews through voice conversations
  - More realistic simulation

- **💳 Payments (Razorpay)**
  - Razorpay integrated for payment workflows
  - PayPal client ID also configurable

- **📱 Clean & Responsive UI**
  - Built using Tailwind CSS & modern components

- **🔗 Dynamic Routes**
  - Unique pages for individual interview sessions

---

## 🛠 Tech Stack

| Layer             | Technology |
|------------------|------------|
| Framework        | Next.js (App Router) |
| Styling          | Tailwind CSS |
| Auth + Database  | Supabase |
| AI Model Access  | OpenRouter API Key |
| Voice Agent      | Vapi |
| Payments         | Razorpay |
| Backend API      | Node.js (`/backend` folder) |

---

## 📂 Project Architecture

```
ai-interview-agent-ai-voice-agent
├── /app 
├── /components
├── /backend     
├── /context    
├── /hooks
├── /lib
├── /pages
├── /public
├── /services
└── ...
```

### **How the System Works**

```
Frontend (Next.js)
│
├─ Auth & DB → Supabase (users, attempts, interview metadata)
├─ Voice Interviews → Vapi (browser ↔ voice agent)
├─ Payments → Razorpay configuration
│
└─ Backend (Node.js)
     ├─ Secure payment handling
     ├─ API routes not exposed to client
     └─ Integrations/webhooks
```

### **Why These Design Choices?**

| Component | Reason |
|----------|--------|
| **Supabase** | Single service for auth + database, reduced complexity |
| **Separate Backend** | Keeps keys secure, handles payments server-side |
| **Vapi** | Avoids building custom audio/voice pipeline |
| **Next.js** | Dynamic routing + modern UI rendering |
| **Razorpay** | Production-ready payment gateway for monetization |

---

## ⚙️ Setup Guide

### **① Clone Repository**

```bash
git clone https://github.com/khwaishagarwal/MockInterviewerAI.git
cd MockInterviewerAI/ai-interview-agent-ai-voice-agent
```

---

### **② Install Dependencies**

**Frontend:**

```bash
npm install
```

**Backend:**

```bash
cd backend
npm install
```

---

### **③ Create `.env.local` in the project root**

> Add your credentials here—do not commit this file.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

OPENROUTER_API_KEY=

NEXT_PUBLIC_HOST_URL=
NEXT_PUBLIC_BACKEND_URL=

NEXT_PUBLIC_VAPI_PUBLIC_KEY=

NEXT_PUBLIC_PAYPAL_CLIENT_ID=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
```

---

### **④ Start the Backend**

From the root folder:

```bash
cd backend
npm start
```

This runs the secure API server (payments, webhooks, server logic).

---

### **⑤ Start the Frontend**

In a separate terminal:

```bash
cd ai-interview-agent-ai-voice-agent
npm run dev
```

Default URL:

```
http://localhost:3000
```

---

## 🧾 Notes for Reviewers

- Focuses on **interview preparation**, not hiring
- Uses production-grade tools (Supabase, Razorpay, Vapi, Next.js)
- Separates **frontend and backend** for security and scalability
- Features **real-time AI + voice-based sessions**

---

## ✨ Future Add-Ons

- Resume-based question generation
- Multiple interview modes
- Analytics dashboard
