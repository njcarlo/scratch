'use client';

import { Status, Task } from '@/types';
import { TaskCard } from './TaskCard';
import { useTasks } from '@/hooks/useTasks';
import { Skeleton } from '@/components/ui/skeleton';

const COLUMNS: { label: string; value: Status }[] = [
    { label: 'Todo', value: 'TODO' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Done', value: 'DONE' },
];

export function BoardView({ searchQuery }: { searchQuery: string }) {
    const { tasks, isLoading } = useTasks();

    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-4">
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[calc(100vh-12rem)]">
            {COLUMNS.map((column) => (
                <div key={column.value} className="flex flex-col gap-4 bg-muted/30 p-4 rounded-xl border border-muted/40">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            {column.label}
                            <span className="bg-muted text-xs px-2 py-0.5 rounded-full">
                                {filteredTasks.filter(t => t.status === column.value).length}
                            </span>
                        </h3>
                    </div>
                    <div className="flex flex-col gap-3">
                        {filteredTasks
                            .filter((task) => task.status === column.value)
                            .map((task) => (
                                <TaskCard key={task.id} task={task} />
                            ))}
                        {filteredTasks.filter(t => t.status === column.value).length === 0 && (
                            <div className="border-2 border-dashed border-muted rounded-lg p-8 flex flex-col items-center justify-center text-muted-foreground transition-colors hover:border-primary/20 bg-background/50">
                                <p className="text-xs">No tasks yet</p>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
