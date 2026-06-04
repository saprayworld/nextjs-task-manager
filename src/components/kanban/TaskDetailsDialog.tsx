"use client";

import React, { useState, useEffect } from "react";
import {
  X, Edit2, Calendar, Clock, Timer, CheckSquare, Square,
  Archive, Trash2, Eye, EyeOff, RefreshCw, AlertCircle, CalendarDays
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryRecord } from "@/lib/category-utils";
import { Task } from "./kanban-board";

export interface BoardColumn {
  id: string | number;
  title: string;
  dotColor: string;
}

interface TaskDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  columns: BoardColumn[];
  categories: CategoryRecord[];
  onEdit: (task: Task) => void;
  onDelete?: () => void | Promise<void>;
  onArchive?: () => void | Promise<void>;
  onToggleVisibility?: () => void | Promise<void>;
  onSubtaskToggle?: (taskId: string, subtaskId: string, isCompleted: boolean) => Promise<void>;
}

export function TaskDetailsDialog({
  open,
  onOpenChange,
  task,
  columns,
  categories,
  onEdit,
  onDelete,
  onArchive,
  onToggleVisibility,
  onSubtaskToggle,
}: TaskDetailsDialogProps) {
  const t = useTranslations("TaskDetailsDialog");
  const tCommon = useTranslations("TaskDialog");
  const locale = useLocale();
  const [isTogglingSubtask, setIsTogglingSubtask] = useState<string | null>(null);

  if (!task) return null;

  const currentColumn = columns.find((c) => c.id === task.columnId);
  const currentCategory = categories.find((c) => c.id === task.categoryId);

  // Formatter Helpers
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      const d = new Date(dateString);
      return d.toLocaleString(locale === "th" ? "th-TH" : "en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };

  const handleSubtaskClick = async (subtaskId: string, currentCompleted: boolean) => {
    if (!onSubtaskToggle || isTogglingSubtask) return;
    setIsTogglingSubtask(subtaskId);
    try {
      await onSubtaskToggle(task.id as string, subtaskId, !currentCompleted);
    } finally {
      setIsTogglingSubtask(null);
    }
  };

  // Calculate Subtask stats
  const subtasks = task.subtasks || [];
  const completedCount = subtasks.filter((st) => st.isCompleted).length;
  const progressPercent = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  // Check if overdue
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.columnId !== "done";
  const isCurrentlyVisible = (task as any).isVisible !== false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[95vw] md:max-w-[85vw] lg:max-w-[960px] w-full max-h-[90vh] flex flex-col overflow-hidden p-0 gap-0"
        onInteractOutside={(e) => e.preventDefault()}
        showCloseButton={false}
        aria-describedby={undefined}
      >
        <DialogTitle className="hidden">
          {t("title")}
        </DialogTitle>

        {/* Upper Action Bar / Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0 bg-background">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("title")}
            </span>
            {task.recurringTemplateId && (
              <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin-slow" />
                {t("recurring")} {task.recurrenceIndex ? `(${t("recurringRound", { round: task.recurrenceIndex })})` : ""}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onEdit(task);
              }}
              className="h-8 gap-1.5 text-xs font-medium cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span className="hidden lg:block">{t("editTask")}</span>
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                <X className="w-4 h-4" />
              </Button>
            </DialogClose>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x">

          {/* Left Column: Title, Description, Checklist */}
          <div className="lg:col-span-2 p-6 space-y-6 lg:overflow-y-auto lg:max-h-full">
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground select-text leading-tight">
                {task.title}
              </h2>
              {task.category && (
                <div className="inline-flex">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${task.category.classes}`} style={task.category.style}>
                    {task.category.text}
                  </span>
                </div>
              )}
            </div>

            {/* Description Section */}
            <div className="space-y-2 pt-4 border-t">
              <h3 className="text-sm font-semibold text-muted-foreground">{tCommon("details")}</h3>
              <div className="bg-muted/10 rounded-lg p-4 border min-h-[100px]">
                {/* TODO(security): Use DOMPurify to sanitize HTML content to prevent XSS injection. */}
                {task.description ? (
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none text-sm text-foreground/90 leading-relaxed [&>ol]:list-decimal [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:pl-5 [&>li]:my-1"
                    dangerouslySetInnerHTML={{ __html: task.description }}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground italic">{t("noDescription")}</p>
                )}
              </div>
            </div>

            {/* Checklist Section */}
            {subtasks.length > 0 && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                    {t("subtasks")}
                  </h3>
                  <span className="text-xs text-muted-foreground font-medium">
                    {completedCount}/{subtasks.length} {t("completed")} ({progressPercent}%)
                  </span>
                </div>

                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="divide-y border rounded-lg overflow-hidden bg-card">
                  {subtasks.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      disabled={isTogglingSubtask === st.id}
                      onClick={() => handleSubtaskClick(st.id!, st.isCompleted)}
                      className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors group disabled:opacity-70 cursor-pointer"
                    >
                      <span className="mt-0.5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
                        {st.isCompleted ? (
                          <CheckSquare className="w-4 h-4 text-primary" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </span>
                      <span className={`text-sm leading-normal transition-all ${st.isCompleted ? "line-through text-muted-foreground font-normal" : "text-foreground font-medium"}`}>
                        {st.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Metadata Sidebar */}
          <div className="p-6 bg-muted/10 space-y-6 lg:overflow-y-auto lg:max-h-full">
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">
                Task Info
              </h3>

              {/* Status */}
              <div className="grid grid-cols-3 gap-2 py-1 items-center">
                <span className="text-xs font-medium text-muted-foreground">{t("status")}</span>
                <div className="col-span-2 flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${currentColumn?.dotColor || "bg-slate-500"}`}></div>
                  <span className="text-xs font-semibold text-foreground">
                    {currentColumn?.title || "-"}
                  </span>
                </div>
              </div>

              {/* Category */}
              <div className="grid grid-cols-3 gap-2 py-1 items-center">
                <span className="text-xs font-medium text-muted-foreground">{t("category")}</span>
                <span className="col-span-2 text-xs font-semibold text-foreground">
                  {currentCategory?.name || "-"}
                </span>
              </div>

              {/* Due Date */}
              <div className="grid grid-cols-3 gap-2 py-1 items-center">
                <span className="text-xs font-medium text-muted-foreground">{t("dueDate")}</span>
                <div className="col-span-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className={`text-xs font-semibold ${isOverdue ? "text-destructive flex items-center gap-1" : "text-foreground"}`}>
                    {formatDate(task.dueDate)}
                    {isOverdue && (
                      <span title="Overdue">
                        <AlertCircle className="w-3 h-3 text-destructive shrink-0" />
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Working Period */}
              {(task.startDateTime || task.endDateTime) && (
                <div className="space-y-1.5 py-1">
                  <span className="text-xs font-medium text-muted-foreground block">{t("workPeriod")}</span>
                  <div className="bg-background border rounded-lg p-2.5 space-y-1.5 shadow-sm">
                    {task.startDateTime && (
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-muted-foreground w-16 font-medium">{tCommon("start")}</span>
                        <span className="text-foreground font-semibold">{formatDateTime(task.startDateTime)}</span>
                      </div>
                    )}
                    {task.endDateTime && (
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-muted-foreground w-16 font-medium">{tCommon("end")}</span>
                        <span className="text-foreground font-semibold">{formatDateTime(task.endDateTime)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Total Time */}
              <div className="grid grid-cols-3 gap-2 py-1 items-center">
                <span className="text-xs font-medium text-muted-foreground">{t("totalTime")}</span>
                <div className="col-span-2 flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold text-foreground">
                    {task.totalWorkTime && task.totalWorkTime > 0 ? (
                      `${task.totalWorkTime} ${tCommon("minutes")} (${Math.floor(task.totalWorkTime / 60)}h ${task.totalWorkTime % 60}m)`
                    ) : (
                      "-"
                    )}
                  </span>
                </div>
              </div>

              {/* Created At */}
              <div className="grid grid-cols-3 gap-2 py-1 items-center border-t pt-3">
                <span className="text-xs font-medium text-muted-foreground">{t("created")}</span>
                <span className="col-span-2 text-[11px] text-muted-foreground" title={task.createdAt}>
                  {formatDateTime(task.createdAt)}
                </span>
              </div>

              {/* Updated At */}
              {task.updatedAt && (
                <div className="grid grid-cols-3 gap-2 py-1 items-center">
                  <span className="text-xs font-medium text-muted-foreground">{t("updated")}</span>
                  <span className="col-span-2 text-[11px] text-muted-foreground" title={task.updatedAt}>
                    {formatDateTime(task.updatedAt)}
                  </span>
                </div>
              )}
            </div>

            {/* Sidebar quick actions */}
            <div className="pt-4 border-t space-y-2">
              {onToggleVisibility && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onToggleVisibility}
                  className="w-full justify-start h-8 text-xs font-medium cursor-pointer"
                >
                  {isCurrentlyVisible ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 mr-2" />
                      {tCommon("hideFromBoard")}
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 mr-2" />
                      {tCommon("showOnBoard")}
                    </>
                  )}
                </Button>
              )}

              {onArchive && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onArchive}
                  className="w-full justify-start h-8 text-xs font-medium cursor-pointer"
                >
                  <Archive className="w-3.5 h-3.5 mr-2" />
                  {tCommon("archive")}
                </Button>
              )}

              {onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="w-full justify-start h-8 text-xs font-medium cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-2" />
                      {tCommon("moveToTrash")}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{tCommon("deleteTitle")}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {tCommon("deleteDescription")}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={onDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        <Trash2 className="w-4 h-4 mr-1.5" />
                        {tCommon("moveToTrash")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
