'use client';

import { useTaskStore } from '@/store/useTaskStore';
import { Button } from '@/components/ui/button';
import { Plus, LayoutGrid, List, Search, Github } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function Header() {
    const { viewMode, setViewMode, setCreateModalOpen, setSearchQuery } = useTaskStore();

    return (
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        TaskFlow
                    </h1>
                    <div className="hidden md:flex relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search tasks..."
                            className="pl-8"
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex border rounded-md p-1 bg-muted/50">
                        <Button
                            variant={viewMode === 'BOARD' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('BOARD')}
                            className="h-8 w-8 p-0"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'LIST' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('LIST')}
                            className="h-8 w-8 p-0"
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        asChild
                    >
                        <a
                            href="https://github.com/njcarlo/scratch"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Github className="h-4 w-4" />
                        </a>
                    </Button>
                    <Button onClick={() => setCreateModalOpen(true)} size="sm" className="gap-1 shadow-lg shadow-primary/20">
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">New Task</span>
                    </Button>
                </div>
            </div>
        </header>
    );
}
