# 🧶 Yarn Business Automation System

![MERN Stack](https://img.shields.io/badge/MERN-Stack-blue)
![Status](https://img.shields.io/badge/Status-Live-green)

A comprehensive B2B ecommerce and ERP solution for textile mills and yarn suppliers. This platform automates the entire supply chain from "Mill to Market," featuring a customer-facing storefront, secure checkout, and a powerful admin dashboard for inventory and order management.

## 🚀 Live Demo

- **Storefront (Customer):** [https://yarn-project-liart.vercel.app](https://yarn-project-liart.vercel.app)
- **Backend API:** [https://yarn-project.onrender.com](https://yarn-project.onrender.com)

## ✨ key Features

### 🛒 Customer Storefront
- **Modern UI:** Responsive, Amazon-like shopping experience built with React & Tailwind CSS.
- **Product Catalog:** Advanced filtering by Yarn Count, Color, and Brand.
- **Secure Checkout:** 3-step checkout process (Address -> Review -> Order).
- **Order Tracking:** Real-time status updates (Pending -> Dispatched -> Delivered).

### 🏭 Admin Dashboard
- **Inventory Management:** Track live stock levels, movements, and alerts.
- **Order Processing:** Accept/Reject orders and update shipping status.
- **Role-Based Access:** Separate panels for Admins and Staff.
- **Analytics:** Visual charts for Sales, Purchases, and Stock trends.

## 🛠️ Tech Stack

- **Frontend:** React.js, Vite, Tailwind CSS, Lucide React
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas (Cloud)
- **Authentication:** JWT (JSON Web Tokens) & Bcrypt
- **Image Hosting:** Cloudinary
- **Deployment:** Vercel (Frontend) + Render (Backend)

## 📦 Project Structure

```bash
yarn-project/
├── backend/          # Express API, Models, Controllers
└── frontend/         # React application, Pages, Components
```

## ⚡ Getting Started (Local Development)

### Prerequisites
- Node.js (v18+)
- MongoDB Connection String

### 1. Clone the Repository
```bash
git clone https://github.com/Sowndhar1/Yarn-project.git
cd Yarn-project
```

### 2. Setup Backend
```bash
cd backend
npm install
# Create a .env file with your MERN credentials
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

---
© 2025 Shivam Yarn Agencies. All rights reserved.
