# 🎥 StreamHub Backend API

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green?logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.x-lightgrey?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen?logo=mongodb)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/Authentication-JWT-black?logo=json-web-tokens)](https://jwt.io/)
[![Cloudinary](https://img.shields.io/badge/Storage-Cloudinary-blue?logo=cloudinary)](https://cloudinary.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A robust, scalable RESTful API built for **StreamHub**, a full-featured video-sharing platform. Built using modern backend architecture patterns with Express.js, MongoDB (Mongoose), Cloudinary for media storage, JWT for secure authentication, and Multer for file streaming/uploads.

---

## 🚀 Architectural Features

- **JWT Authentication & Authorization**: Access tokens paired with HTTP-only Refresh Tokens for secure, seamless session maintenance.
- **Media Upload Pipeline**: Multipart form handling via `Multer` combined with `Cloudinary` SDK integration for async video and image storage/transcoding.
- **Database Architecture**: Complex relational modeling in MongoDB using Mongoose schema hooks, virtuals, and aggregation pipelines (lookup, unwind, project).
- **Pagination & Optimization**: Custom aggregation pagination (`mongoose-aggregate-paginate-v2`) for fast timeline feeds, video catalogs, and search features.
- **Robust Error Handling**: Standardized API response structures (`ApiResponse`) and centralized error classes (`ApiError`) with HTTP status codes.

---

## 🛠️ Tech Stack & Dependencies

- **Runtime Environment**: Node.js (ES6 Module syntax)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Media Hosting**: Cloudinary
- **Authentication**: `jsonwebtoken` (JWT), `bcryptjs`
- **File Uploads**: `multer`
- **Utilities**: `cookie-parser`, `cors`, `dotenv`

---

## 📁 Repository Structure

```text
streamhub-backend/
├── src/
│   ├── controllers/      # Route handler logic (User, Video, Like, Comment, etc.)
│   ├── db/               # Database connection setup
│   ├── middlewares/      # Authentication, file upload (Multer), error middlewares
│   ├── models/           # Mongoose schemas (User, Video, Subscription, Tweet, etc.)
│   ├── routes/           # Express router endpoints
│   ├── utils/            # Async handlers, ApiError, ApiResponse, Cloudinary uploaders
│   ├── app.js            # Express application setup & middleware stack
│   └── index.js          # App entry point & DB connection initialization
├── .env.sample           # Template for environment variables
├── package.json          # Project dependencies and scripts
└── README.md
```
