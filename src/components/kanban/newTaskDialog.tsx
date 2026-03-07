"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

export interface TaskFormData {
  title: string;
  category: string;
  dueDate: string;
  description: string;
}

interface NewTaskDialogProps {
  onAddTask: (data: TaskFormData) => void;
}

export function NewTaskDialog({ onAddTask }: NewTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("design");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTask({ title, category, dueDate, description });
    
    // ปิดหน้าต่างและล้างค่าฟอร์ม
    setOpen(false);
    setTitle("");
    setCategory("design");
    setDueDate("");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 h-9 text-sm font-medium shadow-sm">
          <Plus className="w-4 h-4" />
          สร้างงานใหม่
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">สร้างงานใหม่</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          {/* Title */}
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

          {/* Category & Due Date Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="task-category" className="text-sm font-medium">หมวดหมู่</label>
              {/* ใช้ tag select พื้นฐาน แต่ตกแต่งด้วยคลาสของ shadcn input เพื่อลด Dependency */}
              <select
                id="task-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="design">Design</option>
                <option value="development">Development</option>
                <option value="research">Research</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="task-date" className="text-sm font-medium">วันกำหนดส่ง</label>
              <Input
                type="date"
                id="task-date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full cursor-pointer [color-scheme:light_dark]"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="task-desc" className="text-sm font-medium">รายละเอียด</label>
            <textarea
              id="task-desc"
              rows={3}
              placeholder="เพิ่มรายละเอียดของงานนี้..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </div>

          {/* Submit Buttons */}
          <DialogFooter className="pt-2 flex justify-end gap-3 sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                ยกเลิก
              </Button>
            </DialogClose>
            <Button type="submit">
              สร้างงาน
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}