import React from 'react';
import KanbanList from '@/components/kanban/kanban-list';
import { mockColumns, mockTasks } from '@/components/kanban/mock-data';

export default function ListPage() {
  return (
    <KanbanList 
      initialColumns={mockColumns} 
      initialTasks={mockTasks} 
    />
  );
}