# DeSocio

A social media platform built to help people actually connect with people — instead of doomscrolling.

DeSocio is a full-stack social app built with **Next.js**, **Node.js**, **TypeScript**, and **PostgreSQL**, focused on real-time interaction, privacy, and a clean user experience, backed by a scalable API architecture.

## ✨ Features

### Authentication
- Secure JWT authentication
- Access & refresh token flow
- HTTP-only cookies
- User registration & login
- Protected routes

### User Profiles
- Custom usernames
- Profile information
- Privacy settings
- Public profile pages

### Friend System
- Send friend requests
- Accept or reject requests
- Cancel sent requests
- Remove friends
- Friends-only content visibility

### Posts
- Create text posts
- Upload images
- Multiple visibility options
- Infinite scrolling feed
- Cursor-based pagination
- Delete posts
- Post reactions

### Thoughts
- Lightweight public posts
- Friends-only visibility option
- Separate feed from regular posts

### Search
- Search users by username
- Debounced search
- Instant search results

### Real-time Chat
- One-to-one messaging
- Socket.IO powered
- Live message delivery
- Conversation history

### Media
- Image uploads
- Optimized media serving

---

## Tech Stack

**Frontend**
- Next.js
- React
- TypeScript
- Tailwind CSS
- React Context API

**Backend**
- Node.js
- Express.js
- TypeScript
- Socket.IO

**Database**
- PostgreSQL
- Prisma ORM

**Authentication**
- JWT
- HTTP-only cookies
- bcrypt

---

## Project Structure

```
DeSocio
 │
 ├── client/
 │   ├── app/
 │   ├── components/
 │   ├── context/
 │   ├── hooks/
 │   ├── lib/
 │   └── types/
 │
 ├── server/
 │   ├── controllers/
 │   ├── routes/
 │   ├── middlewares/
 │   ├── services/
 │   ├── prisma/
 │   ├── socket/
 │   ├── utils/
 │   └── types/
 │
 └── README.md
```

---

## Architecture

```
                 ┌──────────────┐
                 │   Next.js    │
                 │   Frontend   │
                 └──────┬───────┘
                        │
                 REST API / Socket.IO
                        │
        ┌───────────────┴───────────────┐
        │                               │
 ┌──────▼──────┐                 ┌──────▼──────┐
 │ Express API │                 │ Socket.IO   │
 │ Controllers │                 │ Real-Time   │
 └──────┬──────┘                 └──────┬──────┘
        │                               │
        └──────────────┬────────────────┘
                        │
                  Prisma ORM
                        │
                  PostgreSQL
```

---

## Installation

### Clone the repository

```bash
git clone https://github.com/Kamalkishor0/desocio.git
cd desocio
```

### Backend Setup

```bash
cd server
npm install
```

Create a `.env` file (example values shown — replace with secure values):

```env
PORT=3001

# Use your local Postgres connection or production DB URL
DATABASE_URL=postgresql://db_user:db_password@localhost:5432/desocio

# Replace with a long random secret
JWT_SECRET=your_jwt_secret_here

# Access token lifetime (examples: 15m, 1h)
ACCESS_TOKEN_EXPIRES=15m

# Refresh token lifetime (examples: 7d, 30d)
REFRESH_TOKEN_EXPIRES=7d

CLIENT_URL=http://localhost:3000
```

Run Prisma:

```bash
npx prisma generate
npx prisma migrate dev
```

Start the backend:

```bash
npm run dev
```

### Frontend Setup

```bash
cd client
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

Run the frontend:

```bash
npm run dev
```

The app will be running at `http://localhost:3000`.

---

## API Overview

**Authentication**
```
POST   /auth/register
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh
GET    /auth/me
```

**Users**
```
GET    /users/:username
GET    /search/:username
```

**Friends**
```
POST   /friends/request
POST   /friends/accept
POST   /friends/reject
DELETE /friends/remove
DELETE /friends/request
GET    /friends
```

**Posts**
```
POST   /posts
GET    /posts
DELETE /posts/:id
POST   /posts/:id/react
```

**Feed**
```
GET /feed/posts
GET /feed/thoughts
```

**Chat (Socket.IO events)**
```
join
leave
message
typing
disconnect
```

---

## Database

Main entities:
- User
- Friendship
- FriendRequest
- Post
- Thought
- Conversation
- Message
- RefreshToken
- PrivacySettings
- PostReaction

---

## Security

- Password hashing with bcrypt
- JWT authentication
- Refresh token rotation
- HTTP-only cookies
- Protected API routes
- Authorization middleware
- Input validation

---

## Performance

- Cursor-based pagination
- Indexed database queries
- Optimized Prisma queries
- Lazy loading
- Infinite scrolling
- Optimized image rendering

---

## Upcoming Features

- End-to-end encrypted messaging (Signal Protocol — X3DH + Double Ratchet)
- Group chats
- Notifications
- Typing indicators
- Read receipts
- Story feature
- Video uploads
- Push notifications
- Light mode

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push the branch
5. Open a pull request

---

## License

This project is licensed under the MIT License.

---

## Author

**Kamalkishor Singh**
- GitHub: [@Kamalkishor0](https://github.com/Kamalkishor0)
