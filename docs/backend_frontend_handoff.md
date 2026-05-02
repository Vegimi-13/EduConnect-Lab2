# EduConnect Backend And Frontend Handoff

Last updated: 2026-05-02

This document summarizes how the current EduConnect backend is structured, how the main features connect to each other, which endpoints frontend can use, and what still needs discussion before moving deeper into frontend work.

## 1. Product Model

EduConnect is a university social platform with four core experiences:

1. Student profiles
2. Social feed and follows
3. Groups with group feeds
4. Real-time conversations through private chats and group channels

The important mental model is:

```txt
User
  -> Profile
  -> Follows other users
  -> Creates posts
  -> Joins groups
  -> Participates in conversations

Group
  -> Members
  -> Join requests
  -> Feed posts
  -> Channels

GroupChannel
  -> Conversation
  -> Messages
```

## 2. Authentication

Authentication is cookie-based.

On login/register, backend returns an `accessToken` in the response and also stores:

```txt
accessToken cookie
refreshToken cookie
```

Most protected endpoints use the `accessToken` cookie through the `authenticate` middleware.

### Auth Endpoints

Base path:

```txt
/api/auth
```

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/register` | No | Register a new user |
| POST | `/login` | No | Login user |
| POST | `/logout` | Yes | Revoke refresh token and clear cookies |
| POST | `/refresh` | Refresh cookie | Issue new tokens |

Register body:

```json
{
  "first_name": "Vegma",
  "last_name": "Ahmetaj",
  "email": "vegma@example.com",
  "password": "password123"
}
```

Login body:

```json
{
  "email": "vegma@example.com",
  "password": "password123"
}
```

## 3. Profiles And Academic Identity

Profiles hold the public student identity:

```txt
headline
bio
location
website_url
visibility
skills
education
courses
```

Profile visibility currently uses:

```txt
public
private
```

### Profile Endpoints

Base path:

```txt
/api/profile
```

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/me` | Yes | Get logged-in user's full profile |
| GET | `/:userId` | Yes | Get another user's public profile |
| PUT | `/me` | Yes | Update my profile |
| GET | `/institutions` | No | Reference list of institutions |
| GET | `/fields` | No | Reference list of fields of study |
| GET | `/courses` | No | Course list, optional filters |
| POST | `/skills` | Yes | Add existing/new skill to my profile |
| DELETE | `/skills/:skill_id` | Yes | Remove skill from my profile |
| POST | `/education` | Yes | Add education entry |
| PUT | `/education/:education_id` | Yes | Update education entry |
| DELETE | `/education/:education_id` | Yes | Delete education entry |
| POST | `/courses` | Yes | Add course to my profile |
| DELETE | `/courses/:course_id` | Yes | Remove course from my profile |

Update profile body:

```json
{
  "headline": "Computer Science student",
  "bio": "Interested in AI and databases",
  "location": "Prizren",
  "website_url": "https://example.com",
  "visibility": "public"
}
```

Add skill body:

```json
{
  "name": "TypeScript"
}
```

or:

```json
{
  "skill_id": 1
}
```

Add education body:

```json
{
  "institution_id": 1,
  "field_id": 1,
  "degree": "Bachelor",
  "start_year": 2023,
  "end_year": null,
  "description": "Software engineering track"
}
```

Add course body:

```json
{
  "course_id": 1,
  "semester": "Fall",
  "year": 2026
}
```

Frontend pages this supports:

```txt
/profile/me
/profile/:userId
/profile/edit
```

## 4. Follows And Social Graph

Follows determine relationships between users and power the following feed.

The follow table uses:

```txt
follower_id
following_id
status
```

Status can be:

```txt
pending
accepted
rejected
```

If the target user's profile is public, follow can become accepted immediately. If private, it can stay pending until accepted.

### Follow Endpoints

Base path:

```txt
/api/follow
```

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/:userId` | Yes | Send follow request to user |
| DELETE | `/:userId` | Yes | Remove follow/follow request |
| PUT | `/:userId/accept` | Yes | Accept request from this user |
| PUT | `/:userId/reject` | Yes | Reject request from this user |
| GET | `/followers/:userId` | No | Get followers of a user |
| GET | `/following/:userId` | No | Get users followed by a user |
| GET | `/requests/pending` | Yes | Get my pending follow requests |

Example flow:

```txt
User 7 follows user 6:
POST /api/follow/6

User 6 accepts user 7:
PUT /api/follow/7/accept

User 7 sees following feed:
GET /api/feed?scope=following
```

Frontend pages this supports:

```txt
/profile/:userId
/followers/:userId
/following/:userId
/notifications or /requests
```

## 5. Feed And Posts

Posts are the main content object.

Post visibility:

```txt
PUBLIC  -> visible publicly
PRIVATE -> visible to author and accepted followers
GROUP   -> belongs to a group
```

Post type:

```txt
TEXT
SHARE
```

The DTO currently has some image-related fields in progress, but the stable implemented feed behavior should be treated as text/share/group posts.

### Feed Endpoint

Base path:

```txt
/api/feed
```

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/` | Yes | Get paginated feed |

Supported query parameters:

| Query | Values | Purpose |
| --- | --- | --- |
| `scope` | `all`, `following`, `mine` | Controls broad feed mode |
| `page` | positive number | Pagination page |
| `limit` | 1-50 | Page size |
| `authorId` | user id | Filter by author |
| `categoryId` | category id | Filter by category |
| `groupId` | group id | Filter by group feed |
| `postType` | `TEXT`, `SHARE` | Filter by post type |
| `visibility` | `PUBLIC`, `PRIVATE`, `GROUP` | Filter by visibility |
| `search` | text | Search post content |

Common frontend calls:

```txt
Home feed:
GET /api/feed?scope=following&page=1&limit=20

Explore/global feed:
GET /api/feed?page=1&limit=20

My posts:
GET /api/feed?scope=mine&page=1&limit=20

Group feed:
GET /api/feed?groupId=1&page=1&limit=20
```

Feed response shape:

```json
{
  "data": [
    {
      "id": 10,
      "user_id": 7,
      "group_id": 1,
      "content": "Hello group feed",
      "visibility": "GROUP",
      "post_type": "TEXT",
      "user": {
        "id": 7,
        "first_name": "Vegma",
        "last_name": "Ahmetaj",
        "email": "vegma@example.com",
        "profile": {
          "headline": null,
          "location": null
        }
      },
      "group": {
        "id": 1,
        "name": "Computer Science Students",
        "visibility": "public"
      },
      "shared_from": null,
      "categories": [],
      "stats": {
        "comments": 0,
        "reactions": 0
      },
      "viewer": {
        "isBookmarked": false,
        "myReaction": null
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

### Post Endpoints

Base path:

```txt
/api/posts
```

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/` | Yes | Create post |
| GET | `/:id` | No | Get single post |
| PUT | `/:id` | Yes | Update own post |
| DELETE | `/:id` | Yes | Soft-delete own post |
| POST | `/:id/share` | Yes | Share/repost a post |
| POST | `/:id/bookmark` | Yes | Bookmark post |
| DELETE | `/:id/bookmark` | Yes | Remove bookmark |

Create public post:

```json
{
  "content": "Hello global feed",
  "visibility": "PUBLIC",
  "post_type": "TEXT"
}
```

Create private post:

```json
{
  "content": "Only my followers can see this",
  "visibility": "PRIVATE",
  "post_type": "TEXT"
}
```

Create group post:

```json
{
  "content": "Hello group feed",
  "visibility": "GROUP",
  "post_type": "TEXT",
  "group_id": 1
}
```

Important group-post rule:

```txt
Only active group members can create GROUP posts.
```

Share post:

```txt
POST /api/posts/5/share
```

```json
{
  "content": "This is interesting"
}
```

### Comments

Base paths are mounted under `/api`.

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/posts/:id/comments` | Yes | Add comment to post |
| PUT | `/comments/:id` | Yes | Update own comment |
| DELETE | `/comments/:id` | Yes | Soft-delete own comment |

Create comment:

```json
{
  "content": "This helped me a lot"
}
```

Reply to comment:

```json
{
  "content": "Replying to you",
  "parent_comment_id": 3
}
```

### Reactions

Base path:

```txt
/api/reactions
```

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/` | Yes | Add/update reaction |

Body:

```json
{
  "target_type": "POST",
  "target_id": 10,
  "reaction_type": "LIKE"
}
```

Supported target types:

```txt
POST
COMMENT
```

Supported reaction types:

```txt
LIKE
LOVE
HAHA
```

### Categories

Base path:

```txt
/api/categories
```

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/` | No | List post categories |

Current note:

```txt
Feed can filter by categoryId, but create-post category assignment is not fully exposed yet.
```

Frontend pages this supports:

```txt
/feed
/explore
/groups/:groupId/feed
/posts/:postId
```

## 6. Groups

Groups are university communities.

Examples:

```txt
Computer Science Students
AI Club
Database Systems 2026
UPZ Internship Board
```

A group contains:

```txt
owner
members
join requests
posts
channels
```

### Group Endpoints

Base path:

```txt
/api/groups
```

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/` | Yes | Create group |
| GET | `/my` | Yes | Get groups where current user is a member |
| GET | `/:id` | No | Get group details |
| PUT | `/:id` | Yes | Update group; owner only |
| DELETE | `/:id` | Yes | Delete group; owner only |
| POST | `/:id/join` | Yes | Join public group or request private group |
| PUT | `/:groupId/requests/:requestId` | Yes | Owner accepts/rejects join request |
| GET | `/:id/members` | No | Get group members |
| PUT | `/:groupId/members/:userId` | Yes | Owner updates member role/status |
| DELETE | `/:groupId/members/:userId` | Yes | Owner or self removes membership |
| GET | `/:id/channels` | No | Get channels in group |
| POST | `/:id/channels` | Yes | Owner creates channel |
| PUT | `/:groupId/channels/:channelId` | Yes | Owner updates channel |
| DELETE | `/:groupId/channels/:channelId` | Yes | Owner deletes channel |

Create group:

```json
{
  "name": "Computer Science Students",
  "description": "Group for CS students",
  "visibility": "public"
}
```

Group creator automatically becomes:

```txt
role: owner
status: active
```

Join group:

```txt
POST /api/groups/1/join
```

If group is public:

```txt
membership is created immediately
```

If group is private:

```txt
join request is created
```

Handle join request:

```txt
PUT /api/groups/1/requests/5
```

```json
{
  "status": "accepted"
}
```

Create group channel:

```txt
POST /api/groups/1/channels
```

```json
{
  "name": "general",
  "type": "text",
  "description": "General group chat"
}
```

Frontend group page proposal:

```txt
/groups/:groupId
  Feed tab      -> GET /api/feed?groupId=:groupId
  Channels tab  -> GET /api/groups/:groupId/channels
  Members tab   -> GET /api/groups/:groupId/members
  About tab     -> GET /api/groups/:groupId
```

## 7. Group Feed Vs Group Chat

This distinction matters for frontend.

### Group Feed

Group feed uses posts:

```txt
Post.group_id
Post.visibility = GROUP
```

Use it for:

```txt
announcements
resources
questions
events
study material
slower discussion
```

Frontend call:

```txt
GET /api/feed?groupId=1
```

### Group Chat

Group chat uses channels and conversations:

```txt
Group
  -> GroupChannel
    -> Conversation
      -> Messages
```

Use it for:

```txt
real-time messages
typing indicators
quick coordination
channel-based discussions
```

## 8. Conversations And Messaging

Conversation is the chat container.

Messages belong to conversations:

```txt
Conversation
  -> Message
  -> MessageStatus
```

Supported conversation types in the model:

```txt
private
channel
group
```

Current implementation rule:

```txt
Private chat uses participant_id.
Group chat should use channel conversations.
Direct type="group" is rejected for now.
```

### Conversation Endpoints

Base path:

```txt
/api/conversations
```

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/` | Yes | Create or get conversation |
| GET | `/` | Yes | Get my conversations |
| GET | `/:id/messages` | Yes | Get message history |

Create private conversation:

```json
{
  "type": "private",
  "participant_id": 6
}
```

Create/get channel conversation:

```json
{
  "type": "channel",
  "group_channel_id": 3
}
```

Rules for channel conversations:

```txt
The group channel must exist.
The user must be an active member of the channel's group.
One channel has one conversation.
If the conversation already exists, it is reused.
```

## 9. Socket.IO Real-Time Messaging

Socket.IO is initialized on the same backend server.

Connection URL:

```txt
ws://localhost:3000
```

Auth:

```json
{
  "token": "ACCESS_TOKEN"
}
```

The socket middleware accepts token from:

```txt
socket.handshake.auth.token
socket.handshake.headers.token
```

### Socket Events

| Event | Direction | Purpose |
| --- | --- | --- |
| `join_conversation` | client -> server | Join socket room for a conversation |
| `joined` | server -> client | Confirms joined conversation |
| `leave_conversation` | client -> server | Leave socket room |
| `send_message` | client -> server | Send message |
| `new_message` | server -> clients | Broadcast new message |
| `update_message` | client -> server | Edit message |
| `message_updated` | server -> clients | Broadcast edited message |
| `delete_message` | client -> server | Delete message |
| `message_deleted` | server -> clients | Broadcast deleted message |
| `typing` | client -> server | User is typing |
| `user_typing` | server -> clients | Typing broadcast |
| `stop_typing` | client -> server | User stopped typing |
| `user_stop_typing` | server -> clients | Stop typing broadcast |
| `read_message` | client -> server | Mark message as read |
| `message_read` | server -> clients | Broadcast read status |
| `exception` | server -> client | Error event |

Join conversation:

```json
{
  "conversation_id": 5
}
```

Send message:

```json
{
  "conversation_id": 5,
  "content": "Hello from channel chat",
  "message_type": "text"
}
```

Read message:

```json
{
  "message_id": 12,
  "conversation_id": 5
}
```

Important safety rules now handled:

```txt
typing and stop_typing verify conversation access
update/delete/read broadcasts use the real conversation from the database
channel messages require group membership
```

## 10. Redis

Redis is already connected and used by Socket.IO:

```txt
@socket.io/redis-adapter
```

Current purpose:

```txt
Allow Socket.IO events to work across multiple backend instances.
```

Recommended next Redis features:

1. Online presence
2. Typing TTL state
3. User-to-socket mapping
4. Unread count cache
5. Rate limiting

Recommended first Redis feature:

```txt
Online presence
```

Possible keys:

```txt
online:user:7 = socket.id
typing:conversation:5:user:7 = true
```

Use TTLs:

```txt
online keys: 60 seconds, refreshed while connected
typing keys: 5 seconds
```

Do not prioritize feed caching yet. Feed responses depend on follows, group membership, comments, reactions, bookmarks, and viewer-specific state, so caching is more complex.

## 11. Frontend Architecture Proposal

Suggested frontend pages:

```txt
/login
/register

/feed
  Home feed from followed users

/explore
  Public discovery area

/profile/me
/profile/:userId

/groups
  Discover/list groups

/groups/:groupId
  Group page shell

/groups/:groupId/feed
  Group posts

/groups/:groupId/channels
  Channel list

/groups/:groupId/channels/:channelId
  Real-time chat

/messages
  Conversation inbox

/messages/:conversationId
  Private conversation or channel conversation
```

Recommended group page tabs:

```txt
Feed
Channels
Members
About
```

Recommended home feed behavior:

```txt
GET /api/feed?scope=following&page=1&limit=20
```

Recommended group feed behavior:

```txt
GET /api/feed?groupId=:groupId&page=1&limit=20
```

Recommended conversation flow:

```txt
1. GET /api/groups/:groupId/channels
2. User clicks channel
3. POST /api/conversations with group_channel_id
4. Connect Socket.IO
5. emit join_conversation
6. emit send_message
```

## 12. Current Known Gaps And Meeting Decisions

These are the points the team should discuss before frontend gets too deep.

### Explore Page

Current feed rule:

```txt
GROUP posts are visible only to active group members.
```

Product question:

```txt
Should public group posts be visible to non-members as previews?
```

Recommended decision:

```txt
Public groups:
  Non-members can preview group posts.
  Only members can post/comment/chat.

Private groups:
  Non-members cannot view posts.
  They can request to join.
```

Possible backend addition:

```txt
GET /api/feed?scope=explore
```

or adjust:

```txt
GET /api/feed?groupId=:groupId
```

to allow preview if group is public.

### Image Posts

There is image-related DTO work present, but image post persistence and file handling should be reviewed before frontend treats image posts as complete.

Meeting decision:

```txt
Do we need image posts for first frontend version?
```

### Categories

Categories can be listed and feed can filter by category, but assigning categories during post creation still needs a clear endpoint/body.

Meeting decision:

```txt
Should create post support category_ids now?
```

### Notifications

The database documentation includes notifications, but notification endpoints are not currently exposed.

Meeting decision:

```txt
Do we need notifications for first frontend version?
```

### Error Handling

Many services throw plain errors. Express currently returns error HTML in some cases.

Recommended backend improvement:

```txt
Add a global JSON error handler.
```

Desired response:

```json
{
  "message": "Group channel not found"
}
```

instead of HTML error pages.

## 13. Testing Checklist Before Frontend

### Auth

```txt
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
```

### Profiles

```txt
GET /api/profile/me
PUT /api/profile/me
POST /api/profile/skills
POST /api/profile/education
POST /api/profile/courses
```

### Follows

```txt
POST /api/follow/:userId
PUT /api/follow/:userId/accept
GET /api/follow/following/:userId
GET /api/feed?scope=following
```

### Groups

```txt
POST /api/groups
POST /api/groups/:id/join
GET /api/groups/my
GET /api/groups/:id/members
```

### Group Posts

```txt
POST /api/posts
GET /api/feed?groupId=:groupId
```

Group post body:

```json
{
  "content": "Hello group",
  "visibility": "GROUP",
  "post_type": "TEXT",
  "group_id": 1
}
```

### Group Channel Chat

```txt
POST /api/groups/:id/channels
POST /api/conversations
GET /api/conversations/:id/messages
Socket.IO join_conversation
Socket.IO send_message
```

Channel conversation body:

```json
{
  "type": "channel",
  "group_channel_id": 1
}
```

## 14. Suggested Next Development Order

Recommended order before frontend fully commits to screens:

1. Decide Explore behavior for public group previews.
2. Add global JSON error handler.
3. Decide whether images/categories are in the first frontend milestone.
4. Add Redis online presence for chat.
5. Start frontend with:
   - auth
   - profile
   - home feed
   - group page/feed
   - group channel chat

## 15. Short Team Summary

Current backend is ready enough to start frontend for:

```txt
auth
profiles
follows
feed
groups
group posts
private conversations
channel conversations
basic real-time chat
```

Main product decisions still open:

```txt
Explore page behavior
public group post previews
image posts
category assignment
notifications
Redis presence
```

