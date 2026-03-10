"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface BoardColumn {
  id: string | number;
  title: string;
  dotColor: string;
}

export interface TaskFormData {
  title: string;
  categoryId: string;
  columnId: string;
  dueDate: string;
  description: string;
}

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskToEdit?: any | null;
  columns: BoardColumn[];
  onSave: (data: TaskFormData) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
}

export function TaskDialog({ open, onOpenChange, taskToEdit, columns, onSave, onDelete }: TaskDialogProps) {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("design");
  const [columnId, setColumnId] = useState("todo");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isEditMode = !!taskToEdit;

  useEffect(() => {
    if (open) {
      setIsSaving(false);
      if (taskToEdit) {
        setTitle(taskToEdit.title || "");
        setCategoryId(taskToEdit.categoryId || "design");
        setColumnId(taskToEdit.columnId || "todo");
        setDueDate(taskToEdit.dueDate || "");
        setDescription(taskToEdit.description || "");
      } else {
        setTitle("");
        setCategoryId("design");
        setColumnId("todo");
        setDueDate("");
        setDescription("");
      }
    }
  }, [open, taskToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({ title, categoryId, columnId, dueDate, description });
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            {isEditMode ? "แก้ไขงาน" : "สร้างงานใหม่"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <fieldset disabled={isSaving} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="task-title" className="text-sm font-medium">
                ชื่องาน <span className="text-destructive">*</span>
              </label>
              <Input
                id="task-title"
                required
                placeholder="เช่น อัปเดตโลโก้เว็บไซต์"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="task-status" className="text-sm font-medium">สถานะ</label>
                <select
                  id="task-status"
                  value={columnId}
                  onChange={(e) => setColumnId(e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {columns.map((col) => (
                    <option key={col.id} value={col.id}>{col.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="task-category" className="text-sm font-medium">หมวดหมู่</label>
                <select
                  id="task-category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="design">Design</option>
                  <option value="development">Development</option>
                  <option value="research">Research</option>
                  <option value="marketing">Marketing</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="task-date" className="text-sm font-medium">กำหนดส่ง</label>
                <Input
                  type="date"
                  id="task-date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full cursor-pointer [color-scheme:light_dark]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="task-desc" className="text-sm font-medium">รายละเอียด</label>
              <textarea
                id="task-desc"
                rows={3}
                placeholder="เพิ่มรายละเอียดของงานนี้..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </div>
          </fieldset>

          <DialogFooter className="pt-2 flex flex-col-reverse sm:flex-row items-center sm:justify-between w-full gap-3 sm:gap-0">
            <div className="w-full sm:w-auto">
              {isEditMode && onDelete && (
                <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting} className="w-full sm:w-auto">
                  {isDeleting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />กำลังลบ...</>
                  ) : (
                    "ลบงาน"
                  )}
                </Button>
              )}
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2 w-full sm:w-auto">
              <DialogClose asChild>
                <Button type="button" variant="ghost" disabled={isSaving} className="w-full sm:w-auto">
                  ยกเลิก
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
                {isSaving ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{isEditMode ? "กำลังบันทึก..." : "กำลังสร้าง..."}</>
                ) : (
                  isEditMode ? "บันทึกการเปลี่ยนแปลง" : "สร้างงาน"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}