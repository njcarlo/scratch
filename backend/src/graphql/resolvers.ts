import { TaskService } from '../services/task.service';
import { CreateTaskInput, UpdateTaskInput } from '../types';

export const resolvers = {
    Query: {
        tasks: () => TaskService.getAllTasks(),
        task: (_: any, { id }: { id: string }) => TaskService.getTaskById(id),
    },
    Mutation: {
        createTask: (_: any, { input }: { input: CreateTaskInput }) => TaskService.createTask(input),
        updateTask: (_: any, { id, input }: { id: string, input: UpdateTaskInput }) => TaskService.updateTask(id, input),
        deleteTask: (_: any, { id }: { id: string }) => TaskService.deleteTask(id),
    },
};
