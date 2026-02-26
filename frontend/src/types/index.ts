export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type Status = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: Status;
    priority: Priority;
    dueDate?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTaskInput {
    title: string;
    description?: string;
    status?: Status;
    priority?: Priority;
    dueDate?: string;
}

export interface UpdateTaskInput {
    title?: string;
    description?: string;
    status?: Status;
    priority?: Priority;
    dueDate?: string;
}

export type ViewMode = 'BOARD' | 'LIST';
