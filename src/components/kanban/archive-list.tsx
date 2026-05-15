"use client";

import React, { useState } from "react";
import { Archive, RotateCcw, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { unarchiveTask, deleteTask } from "@/lib/actions/task";
import { tags } from "./mock-data";

interface ArchiveTask {
  id: string;
  title: string;
  description?: string | null;
  categoryId?: string | null;
  columnId: string;
  dueDate?: string | null;
  updatedAt: Date;
  archivedAt: Date | null;
}

interface ArchiveListProps {
  initialTasks: ArchiveTask[];
}

export default function ArchiveList({ initialTasks }: ArchiveListProps) {
  const t = useTranslations("ArchiveList");
  const locale = useLocale();

  const [tasks, setTasks] = useState<ArchiveTask[]>(initialTasks);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleUnarchive = async (taskId: string, title: string) => {
    setLoadingId(taskId);
    try {
      await unarchiveTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast.success(t('toast.restoreSuccess'), {
        description: t('toast.restoreSuccessDesc', { title }),
      });
    } catch {
      toast.error(t('toast.restoreError'), {
        description: t('toast.errorTryAgain'),
      });
    } finally {
      setLoadingId(null);
    }
  };

  const handleMoveToTrash = async (taskId: string, title: string) => {
    setLoadingId(taskId);
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast.success(t('toast.trashSuccess'), {
        description: t('toast.trashSuccessDesc', { title }),
      });
    } catch {
      toast.error(t('toast.trashError'), {
        description: t('toast.errorTryAgain'),
      });
    } finally {
      setLoadingId(null);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return (
      task.title.toLowerCase().includes(lowerQuery) ||
      task.description?.toLowerCase().includes(lowerQuery)
    );
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-6 py-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Archive className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold tracking-tight">{t('title')}</h2>
            {tasks.length > 0 && (
              <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-medium">
                {t('itemCount', { count: tasks.length })}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('description')}
          </p>
        </div>
        {tasks.length > 0 && (
          <div className="relative flex-1 sm:w-64 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('searchPlaceholder')}
              className="w-full pl-8 h-9 text-sm bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 pt-0 pb-6">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="p-4 bg-muted/50 rounded-full mb-4">
              <Archive className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h3 className="font-semibold text-lg mb-1">{t('emptyState')}</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {t('emptyStateDesc')}
            </p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Search className="w-8 h-8 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">{t('noResults')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task) => {
              const tagInfo = tags[task.categoryId || "design"] || tags.design;
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 sm:p-4 rounded-xl border bg-card hover:bg-accent/50 transition-colors group"
                >
                  {/* Task Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm truncate">{task.title}</h3>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${tagInfo.classes}`}
                      >
                        {tagInfo.text}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('archivedAt', { date: formatDate(task.archivedAt!) })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1.5"
                      onClick={() => handleUnarchive(task.id, task.title)}
                      disabled={loadingId === task.id}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{t('actions.restore')}</span>
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-8 text-xs gap-1.5"
                          disabled={loadingId === task.id}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{t('actions.moveToTrash')}</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('actions.deleteTitle')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('actions.deleteDesc', { title: task.title })}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleMoveToTrash(task.id, task.title)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            <Trash2 className="w-4 h-4 mr-1.5" />
                            {t('actions.moveToTrash')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
