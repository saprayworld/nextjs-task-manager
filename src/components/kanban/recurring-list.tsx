"use client";

import React, { useState } from "react";
import { RefreshCw, Search, Plus, Pause, Play, Pencil, Trash2, CalendarDays, Hash, Clock } from "lucide-react";
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
import { createRecurringTemplate, updateRecurringTemplate, deleteRecurringTemplate, toggleRecurringTemplate } from "@/lib/actions/recurring-task";
import { RecurringTemplateDialog } from "./RecurringTemplateDialog";
import { mockColumns, tags } from "./mock-data";

interface RecurringTemplate {
  id: string;
  title: string;
  description: string | null;
  categoryId: string | null;
  columnId: string;
  recurrenceType: string;
  recurrenceInterval: number;
  recurrenceDayOfMonth: number | null;
  startDate: Date;
  endDate: Date | null;
  maxOccurrences: number | null;
  occurrenceCount: number | null;
  nextRunAt: Date | null;
  lastRunAt: Date | null;
  isActive: boolean;
  subtaskTemplates: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface RecurringListProps {
  initialTemplates: RecurringTemplate[];
}

export default function RecurringList({ initialTemplates }: RecurringListProps) {
  const [templates, setTemplates] = useState<RecurringTemplate[]>(initialTemplates);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<RecurringTemplate | null>(null);

  // === Handlers ===

  const handleCreate = () => {
    setEditingTemplate(null);
    setDialogOpen(true);
  };

  const handleEdit = (template: RecurringTemplate) => {
    setEditingTemplate(template);
    setDialogOpen(true);
  };

  const handleSave = async (data: {
    title: string;
    description: string;
    categoryId: string;
    columnId: string;
    recurrenceType: string;
    recurrenceInterval: number;
    recurrenceDayOfMonth: number | undefined;
    startDate: string;
    endDate: string;
    maxOccurrences: number | undefined;
    subtaskTemplates: string[];
  }) => {
    try {
      if (editingTemplate) {
        // Update
        const updated = await updateRecurringTemplate(editingTemplate.id, {
          title: data.title,
          description: data.description || undefined,
          categoryId: data.categoryId,
          columnId: data.columnId,
          recurrenceType: data.recurrenceType,
          recurrenceInterval: data.recurrenceInterval,
          recurrenceDayOfMonth: data.recurrenceDayOfMonth ?? null,
          startDate: new Date(data.startDate),
          endDate: data.endDate ? new Date(data.endDate) : null,
          maxOccurrences: data.maxOccurrences ?? null,
          subtaskTemplates: data.subtaskTemplates,
        });
        if (updated) {
          setTemplates((prev) =>
            prev.map((t) => (t.id === editingTemplate.id ? (updated as RecurringTemplate) : t))
          );
        }
        toast.success("บันทึกสำเร็จ", { description: `"${data.title}" ถูกอัปเดตแล้ว` });
      } else {
        // Create
        const created = await createRecurringTemplate({
          title: data.title,
          description: data.description || undefined,
          categoryId: data.categoryId,
          columnId: data.columnId,
          recurrenceType: data.recurrenceType,
          recurrenceInterval: data.recurrenceInterval,
          recurrenceDayOfMonth: data.recurrenceDayOfMonth,
          startDate: new Date(data.startDate),
          endDate: data.endDate ? new Date(data.endDate) : undefined,
          maxOccurrences: data.maxOccurrences,
          subtaskTemplates: data.subtaskTemplates,
        });
        if (created) {
          setTemplates((prev) => [...prev, created as RecurringTemplate]);
        }
        toast.success("สร้างงานประจำสำเร็จ", { description: `"${data.title}" พร้อมทำงานแล้ว` });
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: error instanceof Error ? error.message : "กรุณาลองใหม่อีกครั้ง",
      });
    }
  };

  const handleDelete = async () => {
    if (!editingTemplate) return;
    try {
      await deleteRecurringTemplate(editingTemplate.id);
      setTemplates((prev) => prev.filter((t) => t.id !== editingTemplate.id));
      toast.success("ลบสำเร็จ", {
        description: `"${editingTemplate.title}" ถูกลบแล้ว`,
      });
      setDialogOpen(false);
    } catch {
      toast.error("ลบไม่สำเร็จ", { description: "กรุณาลองใหม่อีกครั้ง" });
    }
  };

  const handleToggle = async (templateId: string, title: string) => {
    setLoadingId(templateId);
    try {
      const updated = await toggleRecurringTemplate(templateId);
      if (updated) {
        setTemplates((prev) =>
          prev.map((t) => (t.id === templateId ? (updated as RecurringTemplate) : t))
        );
        toast.success(updated.isActive ? "เปิดใช้งานแล้ว" : "หยุดใช้งานแล้ว", {
          description: `"${title}" ${updated.isActive ? "จะสร้างงานตามกำหนดต่อไป" : "จะไม่สร้างงานจนกว่าจะเปิดใหม่"}`,
        });
      }
    } catch {
      toast.error("เกิดข้อผิดพลาด", { description: "กรุณาลองใหม่อีกครั้ง" });
    } finally {
      setLoadingId(null);
    }
  };

  const handleDeleteFromList = async (templateId: string, title: string) => {
    setLoadingId(templateId);
    try {
      await deleteRecurringTemplate(templateId);
      setTemplates((prev) => prev.filter((t) => t.id !== templateId));
      toast.success("ลบสำเร็จ", { description: `"${title}" ถูกลบแล้ว` });
    } catch {
      toast.error("ลบไม่สำเร็จ", { description: "กรุณาลองใหม่อีกครั้ง" });
    } finally {
      setLoadingId(null);
    }
  };

  // === Helpers ===

  const getRecurrenceLabel = (t: RecurringTemplate) => {
    const intervalText = t.recurrenceInterval > 1 ? `ทุก ${t.recurrenceInterval} ` : "";
    switch (t.recurrenceType) {
      case "daily": return `${intervalText}วัน`;
      case "weekly": return `${intervalText}สัปดาห์`;
      case "monthly": return `${intervalText}เดือน${t.recurrenceDayOfMonth ? ` วันที่ ${t.recurrenceDayOfMonth}` : ""}`;
      case "yearly": return `${intervalText}ปี`;
      default: return t.recurrenceType;
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "—";
    return new Intl.DateTimeFormat("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  const filteredTemplates = templates.filter((t) => {
    if (!searchQuery) return true;
    const lq = searchQuery.toLowerCase();
    return t.title.toLowerCase().includes(lq) || t.description?.toLowerCase().includes(lq);
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-6 py-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold tracking-tight">งานประจำ</h2>
            {templates.length > 0 && (
              <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-medium">
                {templates.length} รายการ
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            จัดการงานที่สร้างอัตโนมัติ เช่น ทุกเดือน ทุกสัปดาห์
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {templates.length > 0 && (
            <div className="relative flex-1 sm:w-64 sm:flex-initial">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="ค้นหางานประจำ..."
                className="w-full pl-8 h-9 text-sm bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
          <Button size="sm" onClick={handleCreate} className="shrink-0">
            <Plus className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">สร้างงานประจำ</span>
            <span className="sm:hidden">สร้าง</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 pt-0 pb-6">
        {templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="p-4 bg-primary/5 rounded-full mb-4">
              <RefreshCw className="w-10 h-10 text-primary/40" />
            </div>
            <h3 className="font-semibold text-lg mb-1">ยังไม่มีงานประจำ</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              สร้างงานประจำเพื่อให้ระบบสร้าง task ให้อัตโนมัติตามกำหนดเวลา
            </p>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-1.5" />
              สร้างงานประจำแรก
            </Button>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Search className="w-8 h-8 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">ไม่พบงานประจำที่ตรงกับคำค้นหา</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTemplates.map((template) => {
              const tagInfo = tags[template.categoryId || "design"] || tags.design;
              return (
                <div
                  key={template.id}
                  className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 rounded-xl border bg-card hover:bg-accent/50 transition-colors group ${
                    !template.isActive ? "opacity-60" : ""
                  }`}
                >
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-medium text-sm truncate">{template.title}</h3>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${tagInfo.classes}`}
                      >
                        {tagInfo.text}
                      </span>
                      {!template.isActive && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-muted text-muted-foreground">
                          หยุดชั่วคราว
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" />
                        {getRecurrenceLabel(template)}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        ถัดไป: {formatDate(template.nextRunAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        สร้างไปแล้ว {template.occurrenceCount ?? 0} ครั้ง
                        {template.maxOccurrences ? ` / ${template.maxOccurrences}` : ""}
                      </span>
                      {template.lastRunAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          ล่าสุด: {formatDate(template.lastRunAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1.5"
                      onClick={() => handleToggle(template.id, template.title)}
                      disabled={loadingId === template.id}
                    >
                      {template.isActive ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">หยุด</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">เปิด</span>
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1.5"
                      onClick={() => handleEdit(template)}
                      disabled={loadingId === template.id}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">แก้ไข</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-8 text-xs gap-1.5"
                          disabled={loadingId === template.id}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">ลบ</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>ลบงานประจำนี้?</AlertDialogTitle>
                          <AlertDialogDescription>
                            &quot;{template.title}&quot; จะถูกลบถาวร แต่งานที่สร้างไปแล้วจะไม่ได้รับผลกระทบ
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteFromList(template.id, template.title)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            <Trash2 className="w-4 h-4 mr-1.5" />
                            ลบ Template
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

      {/* Dialog */}
      <RecurringTemplateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        templateToEdit={editingTemplate}
        columns={mockColumns}
        onSave={handleSave}
        onDelete={editingTemplate ? handleDelete : undefined}
      />
    </div>
  );
}
