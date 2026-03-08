"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Edit2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Task, Tag } from "./kanban-board";
import { BoardColumn } from "./TaskDialog";

// ฟังก์ชันช่วยเหลือสำหรับแสดงผลวันที่
const formatDateDisplay = (dateString?: string) => {
  if (!dateString) return "-";
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
  } catch (e) {
    return dateString;
  }
};

// ส่งออกเป็นฟังก์ชัน เพื่อให้รับค่า columns และ onEditTask จาก component แม่ได้
export const getKanbanColumns = (
  boardColumns: BoardColumn[],
  onEditTask: (task: Task) => void
): ColumnDef<Task>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "Task",
    cell: ({ row }) => <div className="w-[80px]">TASK-{row.getValue("id")}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4 h-8 data-[state=open]:bg-accent"
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const tag = row.original.tag;
      return (
        <div className="flex space-x-2 items-center">
          {tag && (
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border bg-muted/50 text-muted-foreground whitespace-nowrap`}>
              {tag.text}
            </span>
          )}
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("title")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "columnId",
    header: "Status",
    cell: ({ row }) => {
      const columnId = row.getValue("columnId") as string;
      const statusColumn = boardColumns.find((col) => col.id === columnId);
      return (
        <div className="flex w-[100px] items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusColumn?.dotColor || "bg-slate-500"}`}></div>
          <span className="truncate">{statusColumn?.title || "ไม่ระบุ"}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: ({ row }) => {
      const dateStr = row.getValue("dueDate") as string | undefined;
      return <div className="text-muted-foreground">{formatDateDisplay(dateStr)}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const task = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuLabel>การจัดการ</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEditTask(task)}>
              แก้ไขงาน
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              ลบงาน
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];