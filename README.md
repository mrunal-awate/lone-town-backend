# Lone Town – Backend

This is the Node.js + Express backend for the Lone Town app.

## 🌐 API Base URL

https://lone-town-backend.onrender.com

## ⚙️ Routes

- `POST /api/users/register`
- `GET /api/users/match/:id`
- `POST /api/users/unpin/:id`
- `GET /api/users/:id`
- `GET /api/messages/:matchId`
- `GET /api/messages/unlock/:matchId`

## 💾 MongoDB

Uses MongoDB Atlas (cluster0, db: lonetown)

## 🔌 Real-Time

Integrated with Socket.IO for live messaging.
