"use client";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Edit2, Paperclip, MessageSquare, Clock, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Task } from './kanban-board'; // นำเข้า Type จากหน้า Board

const formatDateDisplay = (dateString?: string) => {
  if (!dateString) return null;
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
  } catch (e) {
    return dateString;
  }
}

interface KanbanTaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export function KanbanTaskCard({ task, onEdit }: KanbanTaskCardProps) {
  const t = useTranslations("KanbanBoard");
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
        <div className='flex items-center gap-2 text-xs'>
          {task.tag && (
            <span className={`flex font-sans font-semibold tracking-wider uppercase px-2 py-1 rounded-md ${task.tag.classes}`}>
              {task.tag.text}
            </span>
          )}
          {task.recurringTemplateId && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-primary/10 text-primary flex items-center gap-1" title={t("taskCard.recurringRound", { round: task.recurrenceIndex ?? '?' })}>
              <RefreshCw className="w-3 h-3" />
              #{task.recurrenceIndex}
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
            className="text-muted-foreground hover:text-foreground transition-opacity p-1"
            title={t("taskCard.editTask")}
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

      {(task.subtasks && task.subtasks.length > 0) && task.progress !== undefined && (
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
          {(task.totalWorkTime ?? 0) > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 transition-colors">
              <Clock className="w-3 h-3" /> {`${task.totalWorkTime} ${t("taskCard.totalTimeUnit")}`}
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