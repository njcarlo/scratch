import { gql } from 'apollo-server';

export const typeDefs = gql`
  enum Priority {
    LOW
    MEDIUM
    HIGH
  }

  enum Status {
    TODO
    IN_PROGRESS
    DONE
  }

  type Task {
    id: ID!
    title: String!
    description: String
    status: Status!
    priority: Priority!
    dueDate: String
    createdAt: String!
    updatedAt: String!
  }

  input CreateTaskInput {
    title: String!
    description: String
    status: Status
    priority: Priority
    dueDate: String
  }

  input UpdateTaskInput {
    title: String
    description: String
    status: Status
    priority: Priority
    dueDate: String
  }

  type Query {
    tasks: [Task!]!
    task(id: ID!): Task
  }

  type Mutation {
    createTask(input: CreateTaskInput!): Task!
    updateTask(id: ID!, input: UpdateTaskInput!): Task!
    deleteTask(id: ID!): Boolean!
  }
`;
