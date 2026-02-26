'use client';

import { Task } from '@/types';
import { useTasks } from '@/hooks/useTasks';
import {
    Card,
    CardContent
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Calendar, Tag } from 'lucide-react';

export function ListView({ searchQuery }: { searchQuery: string }) {
    const { tasks, isLoading } = useTasks();

    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const priorityColors = {
        LOW: 'bg-blue-500/10 text-blue-500',
        MEDIUM: 'bg-yellow-500/10 text-yellow-500',
        HIGH: 'bg-red-500/10 text-red-500',
    };

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                ))}
            </div>
        );
    }

    if (filteredTasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl border-muted bg-muted/20">
                <p className="text-muted-foreground">No tasks found matching your search.</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {filteredTasks.map((task) => (
                <Card key={task.id} className="hover:bg-muted/30 transition-colors border-muted/60">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                            <div className={`w-1 h-8 rounded-full ${task.status === 'DONE' ? 'bg-green-500' :
                                    task.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-muted'
                                }`} />
                            <div>
                                <h4 className="font-medium text-sm">{task.title}</h4>
                                <p className="text-xs text-muted-foreground line-clamp-1 max-w-md">
                                    {task.description}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No date'}
                            </div>
                            <Badge variant="outline" className={`${priorityColors[task.priority]} border-none h-6`}>
                                {task.priority}
                            </Badge>
                            <Badge className="h-6 text-[10px] uppercase font-bold tracking-wider">
                                {task.status}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
