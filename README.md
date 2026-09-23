# DeSocio

DeSocio is a full-stack social platform for sharing posts and short thoughts with people you know. It combines friends-only content, a public thought feed, profiles, notifications, and real-time one-to-one chat in a focused interface.

## Features

### Accounts and profiles

- Register, log in, log out, and refresh sessions with JWTs
- HTTP-only authentication cookies with refresh-token rotation
- Google OAuth sign-in and username completion
- Username search and public profiles with bio and profile photo support

### Social graph

- Send, accept, reject, and cancel friend requests
- View friends and manage existing friendships
- Friends-only posts and privacy-aware feed access

### Posts

- Create text posts with up to six uploaded photos
- Friends or private visibility
- Cursor-paginated home feed with infinite scrolling
- React with hearts, claps, or laughs
- Comment on posts, reply to comments, and delete your own content

### Thoughts

- Publish short thoughts as thoughts, ideas, recommendations, or discussions
- Public and private visibility
- Browse public thoughts separately from the private home feed
- Support, save, comment on, and report thoughts
- Reply to thought comments

### Notifications and chat

- Notifications for friend activity, post reactions/comments, thought activity, and system events
- Mark notifications as read
- One-to-one conversations with message history
- Real-time message delivery through Socket.IO

## Tech stack

- **Client:** Next.js 16, React 19, TypeScript, Tailwind CSS, Lucide React
- **Server:** Node.js, Express 5, TypeScript, Socket.IO
- **Database:** PostgreSQL and Prisma 7
- **Authentication:** JWT, HTTP-only cookies, refresh tokens, bcrypt
- **Supporting services:** Redis, Multer, CORS, express-rate-limit

## Project structure

```text
DeSocio/
├── client/
│   └── src/
│       ├── app/             # Next.js routes and layouts
│       ├── components/      # Feed, auth, chat, profile, and UI components
│       ├── context/         # Auth and Socket.IO providers
│       ├── hooks/           # Shared React hooks
│       ├── lib/api/         # API clients
│       └── types/           # Client-side types
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── service/
│   │   ├── socket/
│   │   └── middlewares/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── index.ts
└── README.md
```

## Local setup

### Requirements

- Node.js and npm
- PostgreSQL
- Redis for the server's configured Redis features

### Server

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=3001
DATABASE_URL=postgresql://db_user:db_password@localhost:5432/desocio
JWT_SECRET=replace_with_a_long_random_secret
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:3001

# Optional Google OAuth configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback
```

Generate the Prisma client, apply migrations, and start the API:

```bash
npx prisma generate
npx prisma migrate dev
npm run dev
```

The server runs at `http://localhost:3001` by default.

### Client

```bash
cd client
npm install
```

Create `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

Start the Next.js app:

```bash
npm run dev
```

The client runs at `http://localhost:3000`.

## API overview

All routes below require authentication unless noted otherwise. The server mounts them under the listed prefixes.

| Area | Routes |
| --- | --- |
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me` |
| Google auth | `GET /auth/google`, `GET /auth/google/callback`, `POST /auth/google/complete` |
| Profiles | `GET /profile/:username`, `GET /profile/search/:username` |
| Feed | `GET /feed/posts` |
| Posts | `POST /posts`, `GET /posts`, `GET /posts/:id`, `DELETE /posts/:id`, `POST /posts/:id/react`, `GET /posts/:id/react` |
| Post comments | `POST /posts/:id/comment`, `GET /posts/:id/comments`, `DELETE /posts/comment/:commentId` |
| Thoughts | `POST /thoughts`, `GET /thoughts`, `GET /thoughts/public`, `GET /thoughts/:id`, `DELETE /thoughts/:id` |
| Thought actions | `POST/DELETE /thoughts/:id/support`, `POST/DELETE /thoughts/:id/save`, `GET /thoughts/:id/support`, `GET /thoughts/:id/save` |
| Thought comments | `POST /thoughts/:id/comments`, `GET /thoughts/:id/comments` |
| Friends | `GET /friends`, `GET /friends/friend-requests/received`, `GET /friends/friend-requests/sent`, `POST /friends/request`, `POST /friends/accept`, `POST /friends/reject`, `POST /friends/cancel`, `DELETE /friends/remove` |
| Chat | `POST /chat/conversations/:userId`, `GET /chat/conversations`, `GET /chat/conversations/:conversationId/messages`, `POST /chat/conversations/:conversationId/messages` |
| Notifications | `GET /notifications`, `PATCH /notifications/:notificationId/read` |

## Socket.IO events

The authenticated Socket.IO connection supports:

| Direction | Events |
| --- | --- |
| Client to server | `chat:join`, `chat:leave`, `chat:send-message`, `notifications:create` |
| Server to client | `chat:joined`, `chat:left`, `chat:new-message`, `chat:error`, `notifications:error` |

## Security and performance

- Passwords are hashed with bcrypt.
- JWT access tokens and rotated refresh tokens use HTTP-only cookies.
- Protected routes use authentication and authorization middleware.
- Request rate limiting is applied to sensitive authentication endpoints.
- PostgreSQL indexes support feed, conversation, notification, and relationship queries.
- Feed and message APIs use cursor-friendly ordered queries, and post uploads are served from the server's uploads directory.

## Available scripts

From `client/`:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

From `server/`:

```bash
npm run dev
npm run build
npm run clean
```

## License

This project is licensed under the MIT License.

## Author

**Kamalkishor Singh**
GitHub: [@Kamalkishor0](https://github.com/Kamalkishor0)