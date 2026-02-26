import { create } from 'zustand';
import { ViewMode, Task } from '../types';

interface TaskState {
    viewMode: ViewMode;
    searchQuery: string;
    statusFilter: string | null;
    selectedTask: Task | null;
    isCreateModalOpen: boolean;
    isEditModalOpen: boolean;

    setViewMode: (mode: ViewMode) => void;
    setSearchQuery: (query: string) => void;
    setStatusFilter: (status: string | null) => void;
    setSelectedTask: (task: Task | null) => void;
    setCreateModalOpen: (isOpen: boolean) => void;
    setEditModalOpen: (isOpen: boolean) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
    viewMode: 'BOARD',
    searchQuery: '',
    statusFilter: null,
    selectedTask: null,
    isCreateModalOpen: false,
    isEditModalOpen: false,

    setViewMode: (viewMode) => set({ viewMode }),
    setSearchQuery: (searchQuery) => set({ searchQuery }),
    setStatusFilter: (statusFilter) => set({ statusFilter }),
    setSelectedTask: (selectedTask) => set({ selectedTask }),
    setCreateModalOpen: (isCreateModalOpen) => set({ isCreateModalOpen }),
    setEditModalOpen: (isEditModalOpen) => set({ isEditModalOpen }),
}));
