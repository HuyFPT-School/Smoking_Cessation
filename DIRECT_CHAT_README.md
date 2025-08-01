# Real-time Direct Chat Feature

This feature enables real-time chat between members and coaches using WebSocket technology.

## Backend Components

### Entities

- **DirectChatMessage**: Stores individual chat messages between users
- **ChatRoom**: Manages chat sessions between members and coaches
- **MessageType**: Enum for different message types (TEXT, IMAGE, FILE, SYSTEM)

### Controllers

- **WebSocketChatController**: Handles WebSocket messaging operations
- **DirectChatController**: REST API for chat room management

### Services

- **DirectChatService**: Core business logic for chat operations
- **UserService**: User management operations

### Repositories

- **DirectChatMessageRepository**: Data access for chat messages
- **ChatRoomRepository**: Data access for chat rooms
- **UserRepository**: Data access for users

## Frontend Components

### Services

- **WebSocketService**: Manages WebSocket connections and messaging
- **directChatAPI**: REST API calls for chat management

### Components

- **DirectChat**: Main chat interface for members
- **CoachDashboard**: Specialized dashboard for coaches to manage conversations

## Features

### For Members:

1. **Start New Conversations**: Can initiate chat with available coaches
2. **Real-time Messaging**: Instant message delivery and receiving
3. **Message History**: View previous conversations
4. **Unread Message Indicators**: Badge notifications for new messages
5. **Quick Access**: Button in AI Chat to switch to human coach

### For Coaches:

1. **Client Management**: View all client conversations in one dashboard
2. **Quick Replies**: Pre-defined responses for common situations
3. **Real-time Notifications**: Instant alerts for new messages
4. **Statistics Dashboard**: Overview of total chats, active conversations, and unread messages
5. **Professional Interface**: Dedicated coach-focused UI

## API Endpoints

### REST Endpoints

- `GET /api/direct-chat/rooms/{userId}` - Get user's chat rooms
- `POST /api/direct-chat/rooms/create` - Create or get chat room
- `GET /api/direct-chat/messages/{roomId}` - Get room messages
- `GET /api/direct-chat/coaches` - Get available coaches
- `POST /api/direct-chat/messages/mark-read` - Mark messages as read

### WebSocket Endpoints

- `/app/chat.sendMessage` - Send a message
- `/app/chat.joinRoom` - Join a chat room
- `/app/chat.markAsRead` - Mark messages as read
- `/topic/room/{roomId}` - Subscribe to room messages
- `/topic/user/{userId}/notifications` - Subscribe to user notifications
- `/topic/user/{userId}/errors` - Subscribe to error messages

## Usage

### Setup

1. Backend automatically creates necessary database tables
2. WebSocket is configured to allow connections from `localhost:3000`

### Navigation

- Members: Access via `/direct-chat` route or button in AI Chat
- Coaches: Access via `/coach-dashboard` route

### Authentication

- Uses existing user authentication from localStorage
- Supports role-based access (USER, COACH)

### Real-time Features

- Automatic reconnection on connection loss
- Message delivery confirmation
- Typing indicators (expandable)
- Read receipts

## Database Schema

### direct_chat_message

- id (BIGINT, Primary Key)
- room_id (VARCHAR)
- sender_id (INT, Foreign Key to User)
- receiver_id (INT, Foreign Key to User)
- content (TEXT)
- message_type (ENUM)
- timestamp (DATETIME)
- is_read (BOOLEAN)

### chat_room

- id (BIGINT, Primary Key)
- room_id (VARCHAR, Unique)
- member_id (INT, Foreign Key to User)
- coach_id (INT, Foreign Key to User)
- created_at (DATETIME)
- updated_at (DATETIME)
- is_active (BOOLEAN)

## Security Considerations

- Messages are transmitted over secure WebSocket connections
- User authentication required for all operations
- Role-based access control
- Input validation and sanitization

## Future Enhancements

- File and image sharing
- Voice messages
- Chat room archiving
- Advanced notification preferences
- Mobile app support
