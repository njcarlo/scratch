# API Contract

## GraphQL Schema

### Types

#### Task
- `id: ID!`
- `title: String!`
- `description: String`
- `status: Status!`
- `priority: Priority!`
- `dueDate: String`
- `createdAt: String!`
- `updatedAt: String!`

#### Enums
- `Priority`: `LOW`, `MEDIUM`, `HIGH`
- `Status`: `TODO`, `IN_PROGRESS`, `DONE`

### Queries
- `tasks: [Task!]!`: Get all tasks sorted by creation date.
- `task(id: ID!): Task`: Get a single task by ID.

### Mutations
- `createTask(input: CreateTaskInput!): Task!`: Create a new task.
- `updateTask(id: ID!, input: UpdateTaskInput!): Task!`: Update an existing task.
- `deleteTask(id: ID!): Boolean!`: Delete a task.

## Database Schema (Firestore)
- Collection: `tasks`
- Document structure matches the `Task` type in GraphQL.
