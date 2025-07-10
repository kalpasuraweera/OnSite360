# Tasks Module

This module handles task management functionality for the OnSite360 construction management system.

## Features

### Task Management
- **Create Task**: Create new tasks with comprehensive details
- **Update Task**: Modify existing tasks
- **Delete Task**: Remove tasks
- **List Tasks**: Get tasks with various filtering options
- **Get Task Details**: Retrieve detailed task information

### Comment System
- **Add Comments**: Comment on tasks for collaboration
- **Update Comments**: Edit your own comments
- **Delete Comments**: Remove your own comments
- **List Comments**: View all comments for a task

### Additional Features
- **User Tasks**: Get tasks assigned to current user
- **Project Summary**: Get task statistics for a project
- **User Statistics**: Get task statistics for current user

## API Endpoints

### Task Operations
- `POST /tasks` - Create a new task
- `GET /tasks` - Get all tasks (with filtering)
- `GET /tasks/:id` - Get specific task
- `PATCH /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `GET /tasks/my-tasks` - Get current user's tasks
- `GET /tasks/project/:projectId/summary` - Get project task summary
- `GET /tasks/stats/user` - Get user task statistics

### Comment Operations
- `POST /tasks/comments` - Add comment to task
- `GET /tasks/:taskId/comments` - Get task comments
- `PATCH /tasks/comments/:commentId` - Update comment
- `DELETE /tasks/comments/:commentId` - Delete comment

## Query Parameters

### GET /tasks
- `projectId` - Filter by project
- `assigneeId` - Filter by assignee
- `status` - Filter by task status

### GET /tasks/my-tasks
- `projectId` - Filter by project
- `status` - Filter by task status

## Task Status Options
- `Pending` - Task is waiting to be started
- `In Progress` - Task is currently being worked on
- `Completed` - Task has been finished
- `Cancelled` - Task has been cancelled

## Task Priority Options
- `Low` - Low priority task
- `Medium` - Medium priority task (default)
- `High` - High priority task
- `Critical` - Critical priority task

## DTOs

### CreateTaskDto
Complete task creation with all optional fields including:
- Basic info (title, description)
- Assignment (projectId, assigneeId)
- Status and priority
- Time tracking (estimatedHours, actualHours)
- Dates (dueDate, startedAt, completedAt)
- Metadata (tags, attachments)

### UpdateTaskDto
Partial update DTO that extends CreateTaskDto

### CreateCommentDto
- `taskId` - ID of the task to comment on
- `content` - Comment content

### UpdateCommentDto
Partial update for comments

## Entities

### Task Entity
Comprehensive task representation with:
- Core task data
- Related project information
- Assignee details
- Attachments
- Comments with user information

### Comment Entity
Comment representation with:
- Comment data
- User information
- Timestamps

## Security & Access Control

All endpoints require authentication and verify user access:
- Users must have access to the project to manage tasks
- Only comment authors can update/delete their comments
- Project-level access control through UserProject relationship

## Database Relations

The module leverages Prisma relations:
- `Task` belongs to `Project`
- `Task` can be assigned to `User`
- `Task` can have many `Document` attachments
- `Task` can have many `Comment`s
- `Comment` belongs to `User` and `Task`

## Usage Examples

### Creating a Task
```typescript
const task = await tasksService.create({
  title: "Install electrical wiring",
  description: "Install electrical wiring for the main building",
  projectId: "project-uuid",
  assigneeId: "user-uuid",
  priority: TaskPriority.HIGH,
  dueDate: "2024-02-15T17:00:00Z",
  estimatedHours: 8,
  tags: ["electrical", "priority"]
}, userId);
```

### Adding a Comment
```typescript
const comment = await tasksService.createComment({
  taskId: "task-uuid",
  content: "Work is progressing well, should finish on time."
}, userId);
```

### Getting Project Summary
```typescript
const summary = await tasksService.getProjectTaskSummary(projectId, userId);
// Returns statistics like total tasks, completion rate, overdue tasks
```
