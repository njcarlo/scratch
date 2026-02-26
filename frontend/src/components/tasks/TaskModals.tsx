'use client';

import { useState, useEffect } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { useTasks } from '@/hooks/useTasks';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Priority, Status } from '@/types';

// Native select fallback if shadcn select is not available or preferred
function CustomSelect({
    value,
    onChange,
    options,
    placeholder
}: {
    value: string,
    onChange: (v: any) => void,
    options: { label: string, value: string }[],
    placeholder: string
}) {
    return (
        <div className="relative">
            <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="" disabled>{placeholder}</option>
                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        </div>
    );
}

export function TaskModals() {
    const {
        isCreateModalOpen, setCreateModalOpen,
        isEditModalOpen, setEditModalOpen,
        selectedTask, setSelectedTask
    } = useTaskStore();

    const { createTask, updateTask } = useTasks();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'TODO' as Status,
        priority: 'MEDIUM' as Priority,
        dueDate: '',
    });

    useEffect(() => {
        if (isEditModalOpen && selectedTask) {
            setFormData({
                title: selectedTask.title,
                description: selectedTask.description || '',
                status: selectedTask.status,
                priority: selectedTask.priority,
                dueDate: selectedTask.dueDate ? new Date(selectedTask.dueDate).toISOString().split('T')[0] : '',
            });
        } else if (isCreateModalOpen) {
            setFormData({
                title: '',
                description: '',
                status: 'TODO',
                priority: 'MEDIUM',
                dueDate: '',
            });
        }
    }, [isEditModalOpen, isCreateModalOpen, selectedTask]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditModalOpen && selectedTask) {
                await updateTask({ id: selectedTask.id, input: formData });
                setEditModalOpen(false);
            } else {
                await createTask(formData);
                setCreateModalOpen(false);
            }
            setSelectedTask(null);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <>
            {/* Create Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create New Task</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Title</label>
                            <Input
                                required
                                placeholder="Finish the project..."
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Input
                                placeholder="Detailed description..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Priority</label>
                                <CustomSelect
                                    placeholder="Select Priority"
                                    value={formData.priority}
                                    onChange={v => setFormData({ ...formData, priority: v })}
                                    options={[
                                        { label: 'Low', value: 'LOW' },
                                        { label: 'Medium', value: 'MEDIUM' },
                                        { label: 'High', value: 'HIGH' },
                                    ]}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <CustomSelect
                                    placeholder="Select Status"
                                    value={formData.status}
                                    onChange={v => setFormData({ ...formData, status: v })}
                                    options={[
                                        { label: 'Todo', value: 'TODO' },
                                        { label: 'In Progress', value: 'IN_PROGRESS' },
                                        { label: 'Done', value: 'DONE' },
                                    ]}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Due Date</label>
                            <Input
                                type="date"
                                value={formData.dueDate}
                                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                            />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="submit" className="w-full">Create Task</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Task</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Title</label>
                            <Input
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Input
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Priority</label>
                                <CustomSelect
                                    placeholder="Select Priority"
                                    value={formData.priority}
                                    onChange={v => setFormData({ ...formData, priority: v })}
                                    options={[
                                        { label: 'Low', value: 'LOW' },
                                        { label: 'Medium', value: 'MEDIUM' },
                                        { label: 'High', value: 'HIGH' },
                                    ]}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <CustomSelect
                                    placeholder="Select Status"
                                    value={formData.status}
                                    onChange={v => setFormData({ ...formData, status: v })}
                                    options={[
                                        { label: 'Todo', value: 'TODO' },
                                        { label: 'In Progress', value: 'IN_PROGRESS' },
                                        { label: 'Done', value: 'DONE' },
                                    ]}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Due Date</label>
                            <Input
                                type="date"
                                value={formData.dueDate}
                                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                            />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="submit" className="w-full">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
