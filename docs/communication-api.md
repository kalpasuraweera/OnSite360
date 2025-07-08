# Communication Module API Documentation

## Overview

The Communication module handles thread-based messaging and RFI (Request for Information) management within the OnSite360 construction management system. All routes require authentication via JWT token.

## Features

- **Thread Management**: Create and manage discussion threads for projects
- **Message System**: Send and receive messages within threads
- **RFI System**: Create and manage formal information requests
- **Access Control**: Users can only access threads they are participants in
- **Project Integration**: All communication is linked to specific construction projects

## Authentication

All endpoints require authentication. The JWT token should be passed in the Authorization header:
```
Authorization: Bearer <token>
```

The authenticated user's ID is automatically extracted from the JWT payload (`req.user.sub`).

## API Endpoints

### Thread Routes

#### `POST /communication/threads`
Create a new thread
- **Body**: `CreateThreadDto`
  ```typescript
  {
    title: string;
    description?: string;
    projectId: string;
    participantIds?: string[];
  }
  ```
- **Returns**: Thread with participants and project info

#### `GET /communication/threads`
Get all threads for the current user
- **Returns**: Array of threads with basic info and last message

#### `GET /communication/threads/:id`
Get specific thread details
- **Returns**: Thread with participants, project info, and RFIs

#### `GET /communication/threads/:id/participants`
Get thread participants
- **Returns**: Array of user objects

#### `POST /communication/threads/:id/users`
Add a user to a thread
- **Body**: `AddUserToThreadDto`
  ```typescript
  {
    userId: string;
  }
  ```
- **Returns**: Updated thread with participants

#### `DELETE /communication/threads/:threadId/users/:userId`
Remove a user from a thread
- **Returns**: Updated thread with participants

### Message Routes

#### `POST /communication/messages`
Send a message to a thread
- **Body**: `CreateMessageDto`
  ```typescript
  {
    content: string;
    threadId: string;
  }
  ```
- **Returns**: Created message with sender info

#### `GET /communication/threads/:id/messages`
Get all messages in a thread
- **Returns**: Array of messages with sender info, ordered chronologically

### RFI Routes

#### `POST /communication/rfis`
Create an RFI within a thread
- **Body**: `CreateRFIDto`
  ```typescript
  {
    title: string;
    description: string;
    priority?: string;
    threadId: string;
    assigneeId?: string;
  }
  ```
- **Returns**: Created RFI with requester, assignee, thread, and project info

#### `GET /communication/rfis`
Get all RFIs related to the current user
- **Returns**: Array of RFIs where user is requester, assignee, or thread participant

#### `GET /communication/rfis/:id`
Get specific RFI details
- **Returns**: RFI with full details

#### `PATCH /communication/rfis/:id`
Update an RFI
- **Body**: `UpdateRFIDto`
  ```typescript
  {
    title?: string;
    description?: string;
    priority?: string;
    status?: string;
    response?: string;
    assigneeId?: string;
  }
  ```
- **Returns**: Updated RFI with full details

## Data Models

### Thread
- Connected to a Project
- Has multiple Users as participants
- Contains Messages and RFIs
- Access controlled by participant membership

### Message
- Belongs to a Thread
- Has a sender (User)
- Contains text content
- Timestamped

### RFI (Request for Information)
- Belongs to a Thread and Project
- Has a requester and assignees
- Tracks status and responses
- Used for formal information requests

## Access Control

1. **Project Access**: Users must be assigned to a project to create threads for it
2. **Thread Participation**: Users can only access threads they are participants in
3. **RFI Access**: Users can access RFIs where they are:
   - The requester
   - An assignee
   - A participant in the associated thread

## Error Handling

The API returns appropriate HTTP status codes:
- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (access denied)
- `404`: Not Found (resource doesn't exist or no access)
- `500`: Internal Server Error

## Usage Examples

### Creating a Thread
```bash
POST /communication/threads
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Site Safety Discussion",
  "description": "Weekly safety meeting discussions",
  "projectId": "project-uuid",
  "participantIds": ["user1-uuid", "user2-uuid"]
}
```

### Sending a Message
```bash
POST /communication/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Please review the safety protocols for tomorrow's work.",
  "threadId": "thread-uuid"
}
```

### Creating an RFI
```bash
POST /communication/rfis
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Clarification on Foundation Specifications",
  "description": "Need clarification on the concrete mix requirements for the foundation",
  "priority": "High",
  "threadId": "thread-uuid",
  "assigneeId": "engineer-uuid"
}
```

## Implementation Notes

1. The module uses Prisma ORM for database operations
2. All user IDs are extracted from JWT tokens for security
3. Thread access is enforced at the database level
4. RFI status tracking supports workflow management
5. The system supports both threaded discussions and formal RFI processes

## Future Enhancements

- File attachments for messages and RFIs
- Message reactions and threading
- Real-time notifications
- Message search functionality
- RFI approval workflows
- Email notifications for RFI updates
