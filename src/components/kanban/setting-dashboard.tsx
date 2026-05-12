'use client';

import { useState } from "react";
import {
  Settings,
  Tags,
  LayoutDashboard,
  Bell,
  Database,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  BarChart3,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

// ==========================================
// Types
// ==========================================
interface Category {
  id: string;
  name: string;
  color: string;
  includeInReport: boolean;
}

// ==========================================
// Mock Data
// ==========================================
const initialCategories: Category[] = [
  { id: "1", name: "Design", color: "#3b82f6", includeInReport: true },
  { id: "2", name: "Development", color: "#10b981", includeInReport: true },
  { id: "3", name: "Research", color: "#f59e0b", includeInReport: true },
  { id: "4", name: "Marketing", color: "#8b5cf6", includeInReport: false },
  { id: "5", name: "Work Request", color: "#ef4444", includeInReport: true },
  { id: "6", name: "PM", color: "#f97316", includeInReport: false },
  { id: "7", name: "CM", color: "#06b6d4", includeInReport: true },
];

const colorOptions = [
  "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444",
  "#f97316", "#06b6d4", "#ec4899", "#6366f1", "#14b8a6",
  "#84cc16", "#a855f7",
];

// ==========================================
// Main Component
// ==========================================
export default function SettingDashboard() {
  const t = useTranslations("SettingDashboard");

  // Category State
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState(colorOptions[0]);
  const [newCategoryIncludeInReport, setNewCategoryIncludeInReport] = useState(true);

  // Board Settings State
  const [defaultColumn, setDefaultColumn] = useState("todo");
  const [showProgress, setShowProgress] = useState(true);
  const [showDueDate, setShowDueDate] = useState(true);
  const [showAvatars, setShowAvatars] = useState(true);
  const [showSubtasks, setShowSubtasks] = useState(true);
  const [enableDragDrop, setEnableDragDrop] = useState(true);

  // Notification Settings State
  const [notifyDueDate, setNotifyDueDate] = useState(true);
  const [notifyOverdue, setNotifyOverdue] = useState(true);
  const [notifyStatusChange, setNotifyStatusChange] = useState(false);
  const [dueDateReminder, setDueDateReminder] = useState("1");

  // Data Settings State
  const [autoDeleteTrash, setAutoDeleteTrash] = useState(false);
  const [trashRetentionDays, setTrashRetentionDays] = useState("30");

  // ==========================================
  // Category CRUD Handlers
  // ==========================================
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCategory: Category = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      color: newCategoryColor,
      includeInReport: newCategoryIncludeInReport,
    };
    setCategories([...categories, newCategory]);
    resetCategoryForm();
    setIsAddDialogOpen(false);
    toast.success(t("toast.categoryAdded"), { description: `"${newCategory.name}"` });
  };

  const handleEditCategory = () => {
    if (!editingCategory || !newCategoryName.trim()) return;
    setCategories(categories.map(c =>
      c.id === editingCategory.id
        ? { ...c, name: newCategoryName.trim(), color: newCategoryColor, includeInReport: newCategoryIncludeInReport }
        : c
    ));
    setIsEditDialogOpen(false);
    toast.success(t("toast.categoryUpdated"), { description: `"${newCategoryName.trim()}"` });
  };

  const handleDeleteCategory = () => {
    if (!editingCategory) return;
    setCategories(categories.filter(c => c.id !== editingCategory.id));
    setIsDeleteDialogOpen(false);
    toast.success(t("toast.categoryDeleted"), { description: `"${editingCategory.name}"` });
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryColor(category.color);
    setNewCategoryIncludeInReport(category.includeInReport);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (category: Category) => {
    setEditingCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const openAddDialog = () => {
    resetCategoryForm();
    setIsAddDialogOpen(true);
  };

  const resetCategoryForm = () => {
    setNewCategoryName("");
    setNewCategoryColor(colorOptions[0]);
    setNewCategoryIncludeInReport(true);
  };

  const toggleIncludeInReport = (id: string) => {
    setCategories(categories.map(c =>
      c.id === id ? { ...c, includeInReport: !c.includeInReport } : c
    ));
  };

  // ==========================================
  // Render: Category Form (shared between Add/Edit dialogs)
  // ==========================================
  const renderCategoryForm = () => (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="cat-name">{t("categories.form.name")}</Label>
        <Input
          id="cat-name"
          value={newCategoryName}
          onChange={e => setNewCategoryName(e.target.value)}
          placeholder={t("categories.form.namePlaceholder")}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label>{t("categories.form.color")}</Label>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map(color => (
            <button
              key={color}
              className={`size-8 rounded-full border-2 transition-all hover:scale-110 ${newCategoryColor === color ? "border-foreground scale-110 ring-2 ring-foreground/20" : "border-transparent"}`}
              style={{ backgroundColor: color }}
              onClick={() => setNewCategoryColor(color)}
              type="button"
            />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Checkbox
          id="cat-report"
          checked={newCategoryIncludeInReport}
          onCheckedChange={(checked) => setNewCategoryIncludeInReport(checked === true)}
        />
        <div className="flex flex-col gap-0.5">
          <Label htmlFor="cat-report" className="cursor-pointer">{t("categories.form.includeInReport")}</Label>
          <span className="text-xs text-muted-foreground">{t("categories.form.includeInReportDesc")}</span>
        </div>
      </div>
    </div>
  );

  // ==========================================
  // Render
  // ==========================================
  return (
    <div className="flex flex-col h-full container mx-auto p-4 md:p-6 lg:max-w-5xl overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("description")}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg border border-border/50">
          <Settings className="w-4 h-4" />
          <span>{t("mockDataBadge")}</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="categories" className="flex-1">
        <TabsList className="mb-6 w-full justify-start flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="categories" className="gap-1.5 cursor-pointer">
            <Tags className="w-4 h-4" />
            <span className="hidden sm:inline">{t("tabs.categories")}</span>
          </TabsTrigger>
          <TabsTrigger value="board" className="gap-1.5 cursor-pointer">
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">{t("tabs.board")}</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5 cursor-pointer">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">{t("tabs.notifications")}</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-1.5 cursor-pointer">
            <Database className="w-4 h-4" />
            <span className="hidden sm:inline">{t("tabs.data")}</span>
          </TabsTrigger>
        </TabsList>

        {/* ==========================================
            Tab: Categories (CRUD)
        ========================================== */}
        <TabsContent value="categories">
          <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/10">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Tags className="w-5 h-5 text-blue-500" />
                  {t("categories.title")}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">{t("categories.description")}</p>
              </div>
              <Button onClick={openAddDialog} className="shrink-0 cursor-pointer">
                <Plus data-icon="inline-start" />
                {t("categories.addButton")}
              </Button>
            </div>

            {/* Category List */}
            <div className="divide-y divide-border/50">
              {categories.map(category => (
                <div key={category.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors group">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0 cursor-grab" /> */}
                    <div className="size-4 rounded-full shrink-0" style={{ backgroundColor: category.color }} />
                    <span className="font-medium text-sm truncate">{category.name}</span>
                    {category.includeInReport && (
                      <Badge variant="secondary" className="gap-1 shrink-0 text-xs">
                        <BarChart3 className="w-3 h-3" />
                        {t("categories.reportBadge")}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {/* <Checkbox
                      checked={category.includeInReport}
                      onCheckedChange={() => toggleIncludeInReport(category.id)}
                      aria-label={t("categories.form.includeInReport")}
                    /> */}
                    <Button variant="ghost" size="icon" className="size-8 cursor-pointer" onClick={() => openEditDialog(category)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive cursor-pointer" onClick={() => openDeleteDialog(category)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {categories.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <Tags className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                  <p>{t("categories.emptyState")}</p>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="p-4 bg-muted/20 border-t border-border/50 flex items-center justify-between text-sm text-muted-foreground">
              <span>{t("categories.total", { count: categories.length })}</span>
              <span>{t("categories.inReport", { count: categories.filter(c => c.includeInReport).length })}</span>
            </div>
          </div>
        </TabsContent>

        {/* ==========================================
            Tab: Board Settings
        ========================================== */}
        <TabsContent value="board">
          <div className="flex flex-col gap-6">
            {/* Default Column */}
            <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6">
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-1">
                <LayoutDashboard className="w-5 h-5 text-emerald-500" />
                {t("board.title")}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">{t("board.description")}</p>

              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2 max-w-sm">
                  <Label>{t("board.defaultColumn")}</Label>
                  <Select value={defaultColumn} onValueChange={setDefaultColumn}>
                    <SelectTrigger className="cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="inprogress">In Progress</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <span className="text-xs text-muted-foreground">{t("board.defaultColumnDesc")}</span>
                </div>

                <Separator />

                <div className="flex flex-col gap-4">
                  <Label className="text-base font-medium">{t("board.displayOptions")}</Label>
                  {[
                    { id: "progress", label: t("board.showProgress"), desc: t("board.showProgressDesc"), checked: showProgress, onChange: setShowProgress },
                    { id: "dueDate", label: t("board.showDueDate"), desc: t("board.showDueDateDesc"), checked: showDueDate, onChange: setShowDueDate },
                    { id: "avatars", label: t("board.showAvatars"), desc: t("board.showAvatarsDesc"), checked: showAvatars, onChange: setShowAvatars },
                    { id: "subtasks", label: t("board.showSubtasks"), desc: t("board.showSubtasksDesc"), checked: showSubtasks, onChange: setShowSubtasks },
                  ].map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                      <div className="flex flex-col gap-0.5">
                        <Label htmlFor={`board-${item.id}`} className="cursor-pointer">{item.label}</Label>
                        <span className="text-xs text-muted-foreground">{item.desc}</span>
                      </div>
                      <Switch id={`board-${item.id}`} checked={item.checked} onCheckedChange={item.onChange} className="cursor-pointer" />
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                  <div className="flex flex-col gap-0.5">
                    <Label htmlFor="board-dnd" className="cursor-pointer">{t("board.enableDragDrop")}</Label>
                    <span className="text-xs text-muted-foreground">{t("board.enableDragDropDesc")}</span>
                  </div>
                  <Switch id="board-dnd" checked={enableDragDrop} onCheckedChange={setEnableDragDrop} className="cursor-pointer" />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => toast.success(t("toast.settingsSaved"))} className="cursor-pointer">
                <Save data-icon="inline-start" />
                {t("board.saveButton")}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ==========================================
            Tab: Notifications
        ========================================== */}
        <TabsContent value="notifications">
          <div className="flex flex-col gap-6">
            <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6">
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-1">
                <Bell className="w-5 h-5 text-amber-500" />
                {t("notifications.title")}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">{t("notifications.description")}</p>

              <div className="flex flex-col gap-4">
                {[
                  { id: "dueDate", label: t("notifications.dueDateReminder"), desc: t("notifications.dueDateReminderDesc"), checked: notifyDueDate, onChange: setNotifyDueDate },
                  { id: "overdue", label: t("notifications.overdueAlert"), desc: t("notifications.overdueAlertDesc"), checked: notifyOverdue, onChange: setNotifyOverdue },
                  { id: "statusChange", label: t("notifications.statusChange"), desc: t("notifications.statusChangeDesc"), checked: notifyStatusChange, onChange: setNotifyStatusChange },
                ].map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                    <div className="flex flex-col gap-0.5">
                      <Label htmlFor={`notif-${item.id}`} className="cursor-pointer">{item.label}</Label>
                      <span className="text-xs text-muted-foreground">{item.desc}</span>
                    </div>
                    <Switch id={`notif-${item.id}`} checked={item.checked} onCheckedChange={item.onChange} className="cursor-pointer" />
                  </div>
                ))}

                <Separator />

                <div className="flex flex-col gap-2 max-w-sm">
                  <Label>{t("notifications.reminderDays")}</Label>
                  <Select value={dueDateReminder} onValueChange={setDueDateReminder}>
                    <SelectTrigger className="cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="0">{t("notifications.onDueDay")}</SelectItem>
                        <SelectItem value="1">{t("notifications.daysBefore", { days: 1 })}</SelectItem>
                        <SelectItem value="3">{t("notifications.daysBefore", { days: 3 })}</SelectItem>
                        <SelectItem value="7">{t("notifications.daysBefore", { days: 7 })}</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <span className="text-xs text-muted-foreground">{t("notifications.reminderDaysDesc")}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => toast.success(t("toast.settingsSaved"))} className="cursor-pointer">
                <Save data-icon="inline-start" />
                {t("notifications.saveButton")}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ==========================================
            Tab: Data Management
        ========================================== */}
        <TabsContent value="data">
          <div className="flex flex-col gap-6">
            <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6">
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-1">
                <Database className="w-5 h-5 text-purple-500" />
                {t("data.title")}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">{t("data.description")}</p>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                  <div className="flex flex-col gap-0.5">
                    <Label htmlFor="data-auto-delete" className="cursor-pointer">{t("data.autoDeleteTrash")}</Label>
                    <span className="text-xs text-muted-foreground">{t("data.autoDeleteTrashDesc")}</span>
                  </div>
                  <Switch id="data-auto-delete" checked={autoDeleteTrash} onCheckedChange={setAutoDeleteTrash} className="cursor-pointer" />
                </div>

                {autoDeleteTrash && (
                  <div className="flex flex-col gap-2 max-w-sm ml-3 pl-3 border-l-2 border-border">
                    <Label>{t("data.retentionDays")}</Label>
                    <Select value={trashRetentionDays} onValueChange={setTrashRetentionDays}>
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="7">{t("data.daysOption", { days: 7 })}</SelectItem>
                          <SelectItem value="14">{t("data.daysOption", { days: 14 })}</SelectItem>
                          <SelectItem value="30">{t("data.daysOption", { days: 30 })}</SelectItem>
                          <SelectItem value="90">{t("data.daysOption", { days: 90 })}</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Separator />

                <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                  <h4 className="font-medium text-sm text-destructive mb-1">{t("data.dangerZone")}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{t("data.dangerZoneDesc")}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10 cursor-pointer"
                      onClick={() => toast.info(t("toast.mockOnly"))}>
                      {t("data.clearTrash")}
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10 cursor-pointer"
                      onClick={() => toast.info(t("toast.mockOnly"))}>
                      {t("data.clearArchive")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => toast.success(t("toast.settingsSaved"))} className="cursor-pointer">
                <Save data-icon="inline-start" />
                {t("data.saveButton")}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ==========================================
          Dialogs
      ========================================== */}

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("categories.addDialog.title")}</DialogTitle>
            <DialogDescription>{t("categories.addDialog.description")}</DialogDescription>
          </DialogHeader>
          {renderCategoryForm()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="cursor-pointer">{t("actions.cancel")}</Button>
            <Button onClick={handleAddCategory} disabled={!newCategoryName.trim()} className="cursor-pointer">{t("actions.add")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("categories.editDialog.title")}</DialogTitle>
            <DialogDescription>{t("categories.editDialog.description")}</DialogDescription>
          </DialogHeader>
          {renderCategoryForm()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="cursor-pointer">{t("actions.cancel")}</Button>
            <Button onClick={handleEditCategory} disabled={!newCategoryName.trim()} className="cursor-pointer">{t("actions.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category AlertDialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("categories.deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("categories.deleteDialog.description", { name: editingCategory?.name ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">{t("actions.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer">
              {t("actions.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
