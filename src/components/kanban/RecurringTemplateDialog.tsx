"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Plus, Save, Trash2, X, XIcon, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Input } from "@/components/ui/input";
import { BoardColumn } from "./TaskDialog";
import { CategoryRecord } from "@/lib/category-utils";
import { useTranslations } from "next-intl";

interface RecurringTemplateFormData {
  title: string;
  description: string;
  categoryId: string;
  columnId: string;
  recurrenceType: string;
  recurrenceInterval: number;
  recurrenceDayOfMonth: number | undefined;
  advanceDays: number;
  startDate: string;
  endDate: string;
  maxOccurrences: number | undefined;
  subtaskTemplates: string[];
}

interface RecurringTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateToEdit?: {
    id: string;
    title: string;
    description?: string | null;
    categoryId?: string | null;
    columnId: string;
    recurrenceType: string;
    recurrenceInterval: number;
    recurrenceDayOfMonth?: number | null;
    advanceDays?: number | null;
    startDate: Date;
    endDate?: Date | null;
    maxOccurrences?: number | null;
    subtaskTemplates?: string | null;
  } | null;
  columns: BoardColumn[];
  categories: CategoryRecord[];
  onSave: (data: RecurringTemplateFormData) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
}

const selectClasses = "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export function RecurringTemplateDialog({
  open,
  onOpenChange,
  templateToEdit,
  columns,
  categories,
  onSave,
  onDelete,
}: RecurringTemplateDialogProps) {
  const t = useTranslations("RecurringTemplateDialog");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [columnId, setColumnId] = useState("todo");
  const [recurrenceType, setRecurrenceType] = useState("monthly");
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceDayOfMonth, setRecurrenceDayOfMonth] = useState<number | undefined>(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [maxOccurrences, setMaxOccurrences] = useState<number | undefined>(undefined);
  const [subtaskTemplates, setSubtaskTemplates] = useState<string[]>([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [advanceDays, setAdvanceDays] = useState(0);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isEditMode = !!templateToEdit;

  useEffect(() => {
    if (open) {
      setIsSaving(false);
      setIsDeleting(false);
      if (templateToEdit) {
        setTitle(templateToEdit.title);
        setDescription(templateToEdit.description || "");
        setCategoryId(templateToEdit.categoryId || categories[0]?.id || "");
        setColumnId(templateToEdit.columnId);
        setRecurrenceType(templateToEdit.recurrenceType);
        setRecurrenceInterval(templateToEdit.recurrenceInterval);
        setRecurrenceDayOfMonth(templateToEdit.recurrenceDayOfMonth ?? 1);
        setAdvanceDays(templateToEdit.advanceDays ?? 0);
        setStartDate(templateToEdit.startDate.toISOString().split("T")[0]);
        setEndDate(templateToEdit.endDate ? templateToEdit.endDate.toISOString().split("T")[0] : "");
        setMaxOccurrences(templateToEdit.maxOccurrences ?? undefined);
        try {
          setSubtaskTemplates(
            templateToEdit.subtaskTemplates
              ? JSON.parse(templateToEdit.subtaskTemplates)
              : []
          );
        } catch {
          setSubtaskTemplates([]);
        }
      } else {
        setTitle("");
        setDescription("");
        setCategoryId(categories[0]?.id || "");
        setColumnId("todo");
        setRecurrenceType("monthly");
        setRecurrenceInterval(1);
        setRecurrenceDayOfMonth(1);
        setAdvanceDays(0);
        setStartDate(new Date().toISOString().split("T")[0]);
        setEndDate("");
        setMaxOccurrences(undefined);
        setSubtaskTemplates([]);
      }
      setNewSubtask("");
    }
  }, [open, templateToEdit]);

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtaskTemplates([...subtaskTemplates, newSubtask.trim()]);
    setNewSubtask("");
  };

  const removeSubtask = (index: number) => {
    setSubtaskTemplates(subtaskTemplates.filter((_, i) => i !== index));
  };

  const updateSubtaskTitle = (index: number, newTitle: string) => {
    const updated = [...subtaskTemplates];
    updated[index] = newTitle;
    setSubtaskTemplates(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        title,
        description,
        categoryId,
        columnId,
        recurrenceType,
        recurrenceInterval,
        recurrenceDayOfMonth: recurrenceType === "monthly" ? recurrenceDayOfMonth : undefined,
        advanceDays,
        startDate,
        endDate,
        maxOccurrences,
        subtaskTemplates,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  // ข้อความสรุปสำหรับแสดง preview
  const getRecurrenceSummary = () => {
    const intervalText = recurrenceInterval > 1
      ? t('summary.everyInterval', { interval: recurrenceInterval })
      : t('summary.every');
    switch (recurrenceType) {
      case "daily":
        return `${intervalText}${t('summary.daily')}`;
      case "weekly":
        return `${intervalText}${t('summary.weekly')}`;
      case "monthly":
        return `${intervalText}${t('summary.monthly')}${recurrenceDayOfMonth ? t('summary.monthlyDay', { day: recurrenceDayOfMonth }) : ""}`;
      case "yearly":
        return `${intervalText}${t('summary.yearly')}`;
      default:
        return "";
    }
  };

  const getAdvanceSummary = () => {
    if (advanceDays <= 0) return "";
    return t('summary.advanceDays', { days: advanceDays });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[95vw] md:max-w-[95vw] lg:max-w-[640px] lg:w-full w-[95vw] max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between flex-shrink-0">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-primary" />
              {isEditMode ? t('titleEdit') : t('titleCreate')}
            </span>
            <DialogClose asChild>
              <Button type="button" variant="ghost" className="sm:w-auto p-2!">
                <XIcon className="w-5! h-5!" />
              </Button>
            </DialogClose>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          <div className="no-scrollbar max-h-[60vh] overflow-y-auto px-4">
            <fieldset disabled={isSaving} className="space-y-5">

              {/* ชื่องาน */}
              <div className="space-y-1.5">
                <label htmlFor="recurring-title" className="text-sm font-medium">
                  {t('form.taskName')} <span className="text-destructive">{t('form.taskNameRequired')}</span>
                </label>
                <Input
                  id="recurring-title"
                  required
                  placeholder={t('form.taskNamePlaceholder')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* คำอธิบาย */}
              <div className="space-y-1.5">
                <label htmlFor="recurring-desc" className="text-sm font-medium">{t('form.description')}</label>
                <textarea
                  id="recurring-desc"
                  placeholder={t('form.descriptionPlaceholder')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </div>

              {/* สถานะ + หมวดหมู่ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="recurring-column" className="text-sm font-medium">{t('form.column')} <span className="text-destructive">{t('form.columnRequired')}</span></label>
                  <select
                    id="recurring-column"
                    value={columnId}
                    onChange={(e) => setColumnId(e.target.value)}
                    className={selectClasses}
                  >
                    {columns.map((col) => (
                      <option key={col.id} value={col.id}>{col.title}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="recurring-category" className="text-sm font-medium">{t('form.category')}</label>
                  <select
                    id="recurring-category"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className={selectClasses}
                  >
                    {
                      categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))
                    }
                  </select>
                </div>
              </div>

              {/* ส่วนตั้งค่าความถี่ */}
              <div className="space-y-3 pt-2 border-t mt-4">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-muted-foreground" />
                  <label className="text-sm font-medium">{t('frequency.title')}</label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="recurring-type" className="text-xs text-muted-foreground">{t('frequency.frequencyLabel')}</label>
                    <select
                      id="recurring-type"
                      value={recurrenceType}
                      onChange={(e) => setRecurrenceType(e.target.value)}
                      className={selectClasses}
                    >
                      <option value="daily">{t('frequency.daily')}</option>
                      <option value="weekly">{t('frequency.weekly')}</option>
                      <option value="monthly">{t('frequency.monthly')}</option>
                      <option value="yearly">{t('frequency.yearly')}</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="recurring-interval" className="text-xs text-muted-foreground">{t('frequency.everyLabel')}</label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="recurring-interval"
                        type="number"
                        min={1}
                        max={365}
                        value={recurrenceInterval}
                        onChange={(e) => setRecurrenceInterval(Math.max(1, Number(e.target.value) || 1))}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">
                        {recurrenceType === "daily" && t('frequency.unitDaily')}
                        {recurrenceType === "weekly" && t('frequency.unitWeekly')}
                        {recurrenceType === "monthly" && t('frequency.unitMonthly')}
                        {recurrenceType === "yearly" && t('frequency.unitYearly')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Conditional: วันที่ในเดือน (สำหรับ monthly) */}
                {recurrenceType === "monthly" && (
                  <div className="space-y-1.5">
                    <label htmlFor="recurring-day" className="text-xs text-muted-foreground">{t('frequency.dayOfMonth')}</label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="recurring-day"
                        type="number"
                        min={1}
                        max={31}
                        value={recurrenceDayOfMonth ?? ""}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setRecurrenceDayOfMonth(val >= 1 && val <= 31 ? val : undefined);
                        }}
                        placeholder="1-31"
                        className="w-24"
                      />
                      <span className="text-xs text-muted-foreground">
                        {t('frequency.dayOfMonthHint')}
                      </span>
                    </div>
                  </div>
                )}

                {/* สร้างล่วงหน้า */}
                <div className="space-y-1.5">
                  <label htmlFor="recurring-advance" className="text-xs text-muted-foreground">{t('frequency.advanceDays')}</label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="recurring-advance"
                      type="number"
                      min={0}
                      max={90}
                      value={advanceDays}
                      onChange={(e) => setAdvanceDays(Math.max(0, Number(e.target.value) || 0))}
                      placeholder="0"
                      className="w-24"
                    />
                    <span className="text-xs text-muted-foreground">
                      {t('frequency.advanceDaysHint')}
                    </span>
                  </div>
                </div>


                {/* Preview ข้อความสรุป */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
                  <p className="text-sm text-primary font-medium">
                    📅 {getRecurrenceSummary()}{getAdvanceSummary()}
                  </p>
                </div>
              </div>

              {/* ช่วงเวลา */}
              <div className="space-y-3 pt-2 border-t mt-4">
                <label className="text-sm font-medium">{t('period.title')}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="recurring-start" className="text-xs text-muted-foreground">{t('period.startDate')} <span className="text-destructive">{t('period.startDateRequired')}</span></label>
                    <Input
                      id="recurring-start"
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full cursor-pointer [color-scheme:light_dark]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="recurring-end" className="text-xs text-muted-foreground">{t('period.endDate')}</label>
                    <Input
                      id="recurring-end"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full cursor-pointer [color-scheme:light_dark]"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="recurring-max" className="text-xs text-muted-foreground">{t('period.maxOccurrences')}</label>
                  <Input
                    id="recurring-max"
                    type="number"
                    min={1}
                    value={maxOccurrences ?? ""}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setMaxOccurrences(val > 0 ? val : undefined);
                    }}
                    placeholder={t('period.maxOccurrencesPlaceholder')}
                    className="w-full sm:w-48"
                  />
                </div>
              </div>

              {/* Subtask Templates */}
              <div className="space-y-3 pt-2 border-t mt-4">
                <label className="text-sm font-medium">{t('subtasks.title')}</label>
                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                  {subtaskTemplates.map((st, index) => (
                    <div key={index} className="flex items-center gap-2 group">
                      <span className="text-xs text-muted-foreground w-5 shrink-0 text-center">{index + 1}.</span>
                      <Input
                        value={st}
                        onChange={(e) => updateSubtaskTitle(index, e.target.value)}
                        className="h-7 text-sm px-2 bg-transparent border-transparent hover:border-input focus-visible:border-input"
                      />
                      <button
                        type="button"
                        onClick={() => removeSubtask(index)}
                        className="opacity-100 group-hover:opacity-100 shrink-0 text-muted-foreground hover:text-destructive transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder={t('subtasks.placeholder')}
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSubtask();
                      }
                    }}
                    className="h-8 text-sm"
                  />
                  <Button type="button" variant="secondary" size="sm" onClick={handleAddSubtask} className="h-8 shrink-0">
                    <Plus className="w-4 h-4 mr-1" /> {t('subtasks.add')}
                  </Button>
                </div>
              </div>
            </fieldset>
          </div>

          <DialogFooter className="pt-2 flex flex-col-reverse sm:flex-row items-center sm:justify-between w-full gap-3 sm:gap-0">
            <div className="flex gap-2 w-full sm:w-auto">
              {isEditMode && onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive" disabled={isDeleting} className="sm:w-auto">
                      {isDeleting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="hidden sm:inline">{t('actions.deleting')}</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">{t('actions.deleteTemplate')}</span>
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('deleteDialog.description')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('deleteDialog.cancel')}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        <Trash2 className="w-4 h-4 mr-1.5" />
                        {t('deleteDialog.confirm')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 w-full sm:w-auto">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSaving} className="sm:w-auto">
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('actions.cancel')}</span>
                  <span className="sm:hidden">{t('actions.cancel')}</span>
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSaving} className="sm:w-auto">
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isEditMode ? t('actions.saving') : t('actions.creating')}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span className="hidden sm:inline">{isEditMode ? t('actions.saveChanges') : t('actions.createRecurring')}</span>
                    <span className="sm:hidden">{isEditMode ? t('actions.save') : t('actions.create')}</span>
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
