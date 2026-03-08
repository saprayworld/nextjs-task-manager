import React from 'react';
import KanbanBoard from '@/components/kanban/kanban-board';
import { mockColumns, mockTasks } from '@/components/kanban/mock-data';

export default function Page() {
  return (
    <KanbanBoard 
      initialColumns={mockColumns} 
      initialTasks={mockTasks} 
    />
  );
}