import { db } from '../config/firebase';
import { Task, CreateTaskInput, UpdateTaskInput } from '../types';

const COLLECTION = 'tasks';

export class TaskService {
    static async getAllTasks(): Promise<Task[]> {
        const snapshot = await db.collection(COLLECTION).orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    }

    static async getTaskById(id: string): Promise<Task | null> {
        const doc = await db.collection(COLLECTION).doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() } as Task;
    }

    static async createTask(input: CreateTaskInput): Promise<Task> {
        const now = new Date().toISOString();
        const taskData = {
            ...input,
            status: input.status || 'TODO',
            priority: input.priority || 'MEDIUM',
            createdAt: now,
            updatedAt: now,
        };
        const docRef = await db.collection(COLLECTION).add(taskData);
        return { id: docRef.id, ...taskData } as Task;
    }

    static async updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
        const now = new Date().toISOString();
        await db.collection(COLLECTION).doc(id).update({
            ...input,
            updatedAt: now,
        });
        const updated = await this.getTaskById(id);
        if (!updated) throw new Error('Task not found after update');
        return updated;
    }

    static async deleteTask(id: string): Promise<boolean> {
        await db.collection(COLLECTION).doc(id).delete();
        return true;
    }
}
