"use client";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Edit2, Paperclip, MessageSquare, Clock } from 'lucide-react';
import { Task } from './kanban-board'; // นำเข้า Type จากหน้า Board

const formatDateDisplay = (dateString?: string) => {
  if (!dateString) return null;
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
  } catch(e) { 
    return dateString; 
  }
}

interface KanbanTaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export function KanbanTaskCard({ task, onEdit }: KanbanTaskCardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "Task", task },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-50 scale-95 shadow-lg bg-card border-2 border-dashed border-primary/50 min-h-[140px] rounded-lg"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group bg-card text-card-foreground p-4 rounded-lg border shadow-sm hover:border-primary/50 transition-colors cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center justify-between mb-3">
        {task.tag && (
          <span className={`text-[10px] font-semibold tracking-wider uppercase px-2 py-1 rounded-md ${task.tag.classes}`}>
            {task.tag.text}
          </span>
        )}
        <div className="flex gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
            className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity p-1"
            title="แก้ไขงาน"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <h3 className="font-medium text-sm mb-1">{task.title}</h3>
      {task.description && (
        <div
          className="text-muted-foreground text-xs line-clamp-2 mb-4 prose prose-sm dark:prose-invert max-w-none [&>*]:m-0 [&>*]:text-xs [&>*]:text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: task.description }}
        />
      )}
      
      {task.progress !== undefined && (
        <div className="w-full bg-secondary rounded-full h-1.5 mb-4 overflow-hidden">
          <div className="bg-primary h-1.5 rounded-full" style={{ width: `${task.progress}%` }}></div>
        </div>
      )}

      <div className="flex items-center justify-between text-muted-foreground">
        <div className="flex -space-x-2">
          {task.avatars?.map((avatar, i) => (
            <img key={i} src={avatar} alt="Avatar" className="w-6 h-6 rounded-full border-2 border-card bg-muted" />
          ))}
          {task.initials && (
            <div className="w-6 h-6 rounded-full border-2 border-card bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-medium">
              {task.initials}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3 text-xs">
          {(task.attachments ?? 0) > 0 && (
            <span className="flex items-center gap-1 hover:text-foreground transition-colors">
              <Paperclip className="w-3 h-3" /> {task.attachments}
            </span>
          )}
          {(task.comments ?? 0) > 0 && (
            <span className="flex items-center gap-1 hover:text-foreground transition-colors">
              <MessageSquare className="w-3 h-3" /> {task.comments}
            </span>
          )}
          {task.dueDate && (
            <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${task.dueDateClasses || ''}`}>
              <Clock className="w-3 h-3" /> {formatDateDisplay(task.dueDate)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}