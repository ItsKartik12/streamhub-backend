# StreamHub

A full-stack video-sharing platform built with **React, Node.js, Express, MongoDB, and Cloudinary**.

StreamHub allows users to create accounts, upload and watch videos, interact with content, manage channels, and discover videos through a modern responsive interface.

---

## 🚀 Features

### 🔐 Authentication & User Management

- User registration and login
- JWT-based authentication
- Access and refresh token handling
- Protected routes
- Logout functionality
- Password change
- Update account details
- Avatar and cover image upload
- User channel profiles

### 🎥 Video Management

- Upload videos with thumbnails
- Browse published videos
- Watch individual videos
- Search videos
- Pagination
- Update video details
- Delete videos
- Publish/unpublish videos
- Video ownership protection

### ❤️ Engagement

- Like/unlike videos
- Like/unlike comments
- View liked videos
- Add comments
- Update comments
- Delete comments
- Comment ownership protection

### 👥 Subscriptions

- Subscribe/unsubscribe from channels
- View channel subscribers
- View subscribed channels
- Prevent users from subscribing to their own channel

### 🎨 Frontend

- Responsive React interface
- Home video feed
- Video watch page
- Login and registration pages
- Upload page
- Channel page
- Profile page
- Sidebar navigation
- Reusable video cards
- Loading states
- Protected routes
- Authentication context

### ☁️ Media Storage

- Cloudinary integration for video, thumbnail, avatar, and cover-image storage
- Temporary local upload handling
- Automatic cleanup of temporary files

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- React Router
- Axios
- JavaScript
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Multer
- Cloudinary
- CORS

### Development Tools

- Git & GitHub
- VS Code
- ESLint
- Prettier
- npm

---

## 📁 Project Structure

```text
streamhub/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── db/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── app.js
│   │   ├── constants.js
│   │   └── index.js
│   │
│   ├── public/
│   │   └── temp/
│   │
│   ├── .env.sample
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── public/
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
├── .prettierignore
├── .prettierrc
└── README.md
```
