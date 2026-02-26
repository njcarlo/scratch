'use client';

import { useTaskStore } from '@/store/useTaskStore';
import { BoardView } from '@/components/tasks/BoardView';
import { ListView } from '@/components/tasks/ListView';

export default function Home() {
  const { viewMode, searchQuery } = useTaskStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight">Your Tasks</h2>
        <p className="text-muted-foreground">
          Manage, track, and complete your daily tasks with ease.
        </p>
      </div>

      <div className="transition-all duration-300 ease-in-out">
        {viewMode === 'BOARD' ? (
          <BoardView searchQuery={searchQuery} />
        ) : (
          <ListView searchQuery={searchQuery} />
        )}
      </div>
    </div>
  );
}
