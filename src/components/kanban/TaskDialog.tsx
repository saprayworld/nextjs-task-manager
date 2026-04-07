"use client";

import React, { useState, useEffect } from "react";
import { CheckSquare, Loader2, Plus, Square, Trash2, Archive, Save, X, CalendarClock, Timer, XIcon, Eye, EyeOff, RefreshCw } from "lucide-react";
import { TiptapEditor } from "@/components/tiptap-editor";
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

export interface BoardColumn {
  id: string | number;
  title: string;
  dotColor: string;
}

export interface SubtaskData {
  id?: string;
  title: string;
  isCompleted: boolean;
}

export interface TaskFormData {
  title: string;
  categoryId: string;
  columnId: string;
  dueDate: string;
  description: string;
  subtasks: SubtaskData[];
  startDateTime: string;
  endDateTime: string;
  totalWorkTime: number;
}

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskToEdit?: any | null;
  columns: BoardColumn[];
  onSave: (data: TaskFormData) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
  onArchive?: () => void | Promise<void>;
  onToggleVisibility?: () => void | Promise<void>;
}

export function TaskDialog({ open, onOpenChange, taskToEdit, columns, onSave, onDelete, onArchive, onToggleVisibility }: TaskDialogProps) {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("design");
  const [columnId, setColumnId] = useState("todo");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [totalWorkTime, setTotalWorkTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);

  const [subtasks, setSubtasks] = useState<SubtaskData[]>([]);
  const [newSubtask, setNewSubtask] = useState("");

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
        setStartDateTime(taskToEdit.startDateTime || "");
        setEndDateTime(taskToEdit.endDateTime || "");
        setTotalWorkTime(taskToEdit.totalWorkTime || 0);
        // โหลดข้อมูลงานย่อย ถ้าไม่มีให้เป็นอาร์เรย์ว่าง
        setSubtasks(taskToEdit.subtasks || []);
      } else {
        setTitle("");
        setCategoryId("design");
        setColumnId("todo");
        setDueDate("");
        setDescription("");
        setStartDateTime("");
        setEndDateTime("");
        setTotalWorkTime(0);
        setSubtasks([]);
      }
      setNewSubtask(""); // ล้างช่องพิมพ์งานย่อยเสมอเมื่อเปิด
    }
  }, [open, taskToEdit]);

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks([...subtasks, { id: crypto.randomUUID(), title: newSubtask, isCompleted: false }]);
    setNewSubtask("");
  };

  const toggleSubtask = (index: number) => {
    const newSubtasks = [...subtasks];
    newSubtasks[index].isCompleted = !newSubtasks[index].isCompleted;
    setSubtasks(newSubtasks);
  };

  const updateSubtaskTitle = (index: number, newTitle: string) => {
    const newSubtasks = [...subtasks];
    newSubtasks[index].title = newTitle;
    setSubtasks(newSubtasks);
  };

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({ title, categoryId, columnId, dueDate, description, subtasks, startDateTime, endDateTime, totalWorkTime });
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

  const handleArchive = async () => {
    if (!onArchive) return;
    setIsArchiving(true);
    try {
      await onArchive();
    } finally {
      setIsArchiving(false);
    }
  };

  const handleToggleVisibility = async () => {
    if (!onToggleVisibility) return;
    setIsTogglingVisibility(true);
    try {
      await onToggleVisibility();
    } finally {
      setIsTogglingVisibility(false);
    }
  };

  const isCurrentlyVisible = taskToEdit?.isVisible !== false;

  // คำนวณสถิติ
  const completedCount = subtasks.filter(st => st.isCompleted).length;
  const progressPercent = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[95vw] md:max-w-[95vw] lg:max-w-[1024px] lg:w-full w-[95vw] max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between flex-shrink-0">
            {isEditMode ? "แก้ไขงาน" : "สร้างงานใหม่"}
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

              {/* แสดงข้อมูล Recurring (อ่านอย่างเดียว) */}
              {isEditMode && taskToEdit?.recurringTemplateId && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20">
                  <RefreshCw className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-xs text-primary">
                    <span className="font-medium">งานประจำ</span> — สร้างอัตโนมัติ รอบที่ {taskToEdit.recurrenceIndex ?? '?'}
                  </p>
                </div>
              )}

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

              {/* วันเวลาเริ่มงาน / สิ้นสุด / เวลาที่ใช้ */}
              <div className="space-y-3 pt-2 border-t mt-4">
                <div className="flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-muted-foreground" />
                  <label className="text-sm font-medium">ช่วงเวลาทำงาน</label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="task-start" className="text-xs text-muted-foreground">เริ่มงาน</label>
                    <Input
                      type="datetime-local"
                      id="task-start"
                      value={startDateTime}
                      onChange={(e) => setStartDateTime(e.target.value)}
                      className="w-full cursor-pointer [color-scheme:light_dark]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="task-end" className="text-xs text-muted-foreground">สิ้นสุด</label>
                    <Input
                      type="datetime-local"
                      id="task-end"
                      value={endDateTime}
                      onChange={(e) => setEndDateTime(e.target.value)}
                      className="w-full cursor-pointer [color-scheme:light_dark]"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-muted-foreground" />
                    <label htmlFor="task-worktime" className="text-xs text-muted-foreground">เวลาที่ใช้ทั้งหมด (นาที)</label>
                  </div>
                  <Input
                    type="number"
                    id="task-worktime"
                    min={0}
                    value={totalWorkTime}
                    onChange={(e) => setTotalWorkTime(Number(e.target.value) || 0)}
                    placeholder="เช่น 120"
                    className="w-full sm:w-48"
                  />
                  {totalWorkTime > 0 && (
                    <p className="text-xs text-muted-foreground">
                      ≈ {Math.floor(totalWorkTime / 60)} ชั่วโมง {totalWorkTime % 60} นาที
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">รายละเอียด</label>
                <TiptapEditor
                  content={description}
                  onChange={setDescription}
                  placeholder="เพิ่มรายละเอียดของงานนี้..."
                  disabled={isSaving}
                />
              </div>

              {/* Checklist UI */}
              <div className="space-y-3 pt-2 border-t mt-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">รายการย่อย (Checklist)</label>
                  {subtasks.length > 0 && <span className="text-xs text-muted-foreground">{completedCount}/{subtasks.length} สำเร็จ ({progressPercent}%)</span>}
                </div>

                {subtasks.length > 0 && (
                  <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                    <div className="bg-primary h-1.5 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                )}

                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                  {subtasks.map((st, index) => (
                    <div key={st.id || index} className="flex items-start gap-2 group">
                      <button type="button" onClick={() => toggleSubtask(index)} className="mt-1 shrink-0 text-muted-foreground hover:text-primary transition-colors">
                        {st.isCompleted ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4" />}
                      </button>
                      <Input
                        value={st.title}
                        onChange={(e) => updateSubtaskTitle(index, e.target.value)}
                        className={`h-7 text-sm px-2 bg-transparent border-transparent hover:border-input focus-visible:border-input ${st.isCompleted ? 'line-through text-muted-foreground' : ''}`}
                      />
                      <button type="button" onClick={() => removeSubtask(index)} className="opacity-100 group-hover:opacity-100 mt-1 shrink-0 text-muted-foreground hover:text-destructive transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    placeholder="เพิ่มรายการย่อย..."
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(); } }}
                    className="h-8 text-sm"
                  />
                  <Button type="button" variant="secondary" size="sm" onClick={handleAddSubtask} className="h-8 shrink-0">
                    <Plus className="w-4 h-4 mr-1" /> เพิ่ม
                  </Button>
                </div>
              </div>
            </fieldset>
          </div>

          <DialogFooter className="pt-2 flex flex-col-reverse sm:flex-row items-center sm:justify-between w-full gap-3 sm:gap-0">
            <div className="flex gap-2 w-full sm:w-auto">
              {isEditMode && onToggleVisibility && (
                <Button type="button" variant="outline" onClick={handleToggleVisibility} disabled={isTogglingVisibility} className="sm:w-auto gap-1.5">
                  {isTogglingVisibility ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="hidden sm:inline">กำลังดำเนินการ...</span>
                    </>
                  ) : isCurrentlyVisible ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      <span className="hidden sm:inline">ซ่อนจาก Board</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">แสดงใน Board</span>
                    </>
                  )}
                </Button>
              )}
              {isEditMode && onArchive && (
                <Button type="button" variant="outline" onClick={handleArchive} disabled={isArchiving} className="sm:w-auto gap-1.5">
                  {isArchiving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="hidden sm:inline">กำลังเก็บ...</span>
                    </>
                  ) : (
                    <>
                      <Archive className="w-4 h-4" />
                      <span className="hidden sm:inline">เก็บเข้าคลัง</span>
                    </>
                  )}
                </Button>
              )}
              {isEditMode && onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive" disabled={isDeleting} className="sm:w-auto">
                      {isDeleting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="hidden sm:inline">กำลังย้าย...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">ย้ายไปถังขยะ</span>
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>ย้ายงานไปถังขยะ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        งานนี้จะถูกย้ายไปที่ถังขยะ คุณสามารถกู้คืนได้ภายหลัง
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        <Trash2 className="w-4 h-4 mr-1.5" />ย้ายไปถังขยะ
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
                  <span className="hidden sm:inline">ยกเลิก</span>
                  <span className="sm:hidden">ยกเลิก</span>
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSaving} className="sm:w-auto"
                aria-label={isEditMode ? "save-edit-task" : "create-task"}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isEditMode ? "กำลังบันทึก..." : "กำลังสร้าง..."}
                  </>
                ) : (
                  isEditMode ?
                    <>
                      <Save className="w-4 h-4" />
                      <span className="hidden sm:inline">บันทึกการเปลี่ยนแปลง</span>
                      <span className="sm:hidden">บันทึก</span>
                    </>
                    : <>
                      <Save className="w-4 h-4" />
                      <span className="hidden sm:inline">สร้างงาน</span>
                      <span className="sm:hidden">สร้าง</span>
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