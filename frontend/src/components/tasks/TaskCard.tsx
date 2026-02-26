'use client';

import { Task, Status } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useTaskStore } from '@/store/useTaskStore';
import { format } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useTasks } from '@/hooks/useTasks';

interface TaskCardProps {
    task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
    const { setSelectedTask, setEditModalOpen } = useTaskStore();
    const { updateTask, deleteTask } = useTasks();

    const isOptimistic = task.id.startsWith('temp-');

    const priorityColors = {
        LOW: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        MEDIUM: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        HIGH: 'bg-red-500/10 text-red-500 border-red-500/20',
    };

    const handleEdit = () => {
        if (isOptimistic) return;
        setSelectedTask(task);
        setEditModalOpen(true);
    };

    const handleStatusMove = (newStatus: Status) => {
        if (isOptimistic) return;
        updateTask({ id: task.id, input: { status: newStatus } });
    };

    const statusOptions: { label: string; value: Status }[] = [
        { label: 'Todo', value: 'TODO' },
        { label: 'In Progress', value: 'IN_PROGRESS' },
        { label: 'Done', value: 'DONE' },
    ];

    return (
        <Card className={`group hover:shadow-md transition-all duration-200 border-muted/60 ${isOptimistic ? 'opacity-60 cursor-not-allowed' : ''}`}>
            <CardHeader className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                    <Badge variant="outline" className={priorityColors[task.priority]}>
                        {task.priority}
                    </Badge>
                    {!isOptimistic && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleEdit}>
                                    <Edit2 className="h-4 w-4 mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground/60 py-1">Move to:</DropdownMenuLabel>
                                {statusOptions.filter(o => o.value !== task.status).map(o => (
                                    <DropdownMenuItem key={o.value} onClick={() => handleStatusMove(o.value)}>
                                        {o.label}
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => deleteTask(task.id)}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
                <CardTitle className="text-base line-clamp-1">{task.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                    {task.description || 'No description provided.'}
                </p>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between items-center text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'No date'}</span>
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider opacity-50">
                    {isOptimistic ? 'Saving...' : task.status}
                </div>
            </CardFooter>
        </Card>
    );
}

