"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Edit2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4 h-8 data-[state=open]:bg-accent mx-1"
          >
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const tag = row.original.tag;
        const description = row.original.description;
        return (
          <div 
            className="flex flex-col gap-1 py-1 cursor-pointer group"
            onClick={() => onEditTask(row.original)}
          >
            <div className="flex space-x-2 items-center">
              {tag && (
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border bg-muted/50 text-muted-foreground whitespace-nowrap`}>
                  {tag.text}
                </span>
              )}
              <span className="max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[500px] truncate font-medium group-hover:text-primary group-hover:underline transition-colors">
                {row.getValue("title")}
              </span>
            </div>
            {description && (
              <div
                className="text-xs text-muted-foreground line-clamp-1 max-w-[250px] sm:max-w-[350px] md:max-w-[450px] lg:max-w-[550px] prose prose-sm dark:prose-invert [&>*]:m-0 [&>*]:text-xs [&>*]:text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            )}
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