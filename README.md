# social-backend
# 🚀 Social Media Backend

A production-ready backend for social apps with posts, reels, comments, likes, saves, feeds, follows, conversations, messages, file uploads, and realtime messaging.

---

## Features

- **Authentication**: JWT-based signup, login, and token refresh
- **User Profiles**: Manage avatars and basic info
- **Posts & Reels**: Upload images/videos, captions, and types
- **Cursor-based Feeds**: Infinite scroll with deterministic order (`createdAt`, `id`)
- **Likes & Saves**: Like, unlike, save, unsave posts
- **Comments**: Create, delete, cursor-based pagination
- **Follow System**: Follow/unfollow, followers & following queries
- **Conversations & Messages**: Private 1-on-1 messaging, Socket.IO for realtime
- **File Uploads**: Local storage (or S3)
- **Security**: CORS, Helmet, JWT

---

## Tech Stack

- **Backend**: Node.js, Express.js  
- **Database**: SQLite (dev) / PostgreSQL (prod)  
- **ORM**: Sequelize  
- **Realtime**: Socket.IO  
- **Authentication**: JWT  
- **Uploads**: Multer / S3 optional  

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create a new user  
- `POST /api/auth/login` - Login user and return JWT  
- `POST /api/auth/refresh` - Refresh JWT token  

### Users & Profiles
- `GET /api/users/:id/profile` - Fetch user profile, followers/following counts, post count  
- `POST /api/users/:id/follow` - Follow a user  
- `DELETE /api/users/:id/follow` - Unfollow a user  
- `GET /api/users/:id/followers` - List followers  
- `GET /api/users/:id/following` - List following  

### Posts & Feeds
- `GET /api/feeds?type=post|reel&cursor=&limit=12` - Infinite scroll feed of posts by people you follow  
- `POST /api/posts` - Create a post/reel (image/video + caption)  
- `DELETE /api/posts/:id` - Delete a post  
- `POST /api/posts/:id/like` - Like a post  
- `DELETE /api/posts/:id/like` - Unlike a post  
- `POST /api/posts/:id/save` - Save a post  
- `DELETE /api/posts/:id/save` - Unsave a post  

### Comments
- `GET /api/posts/:id/comments?cursor=&limit=12` - Cursor-based comment list  
- `POST /api/posts/:id/comments` - Add a comment  
- `DELETE /api/comments/:id` - Delete a comment  

### Conversations & Messages
- `GET /api/conversations?userId=TARGET_ID` - Get or create 1-on-1 conversation  
- `GET /api/conversations/:id/messages?cursor=` - Fetch messages of a conversation  

**Realtime (Socket.IO):**
- `join_conversation` - Join a room  
- `leave_conversation` - Leave a room  
- `send_message` - Emit a message  
- `message` - Listen for incoming messages  

### File Uploads
- `POST /api/uploads` - Upload files (images/videos)  
  - Returns file ID, URL, type  

### Cursor Pagination
- Cursor format: `{ id, createdAt }`  
- Base64 encoded  
- Used for infinite scroll: return `limit + 1` items and generate `nextCursor`  

---

## Quickstart

```bash
git clone https://github.com/yourusername/project-backend.git
cd project-backend
cp .env.example .env
npm install
npm run dev
