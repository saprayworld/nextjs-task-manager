'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export interface Task {
  id?: string
  title: string
  description: string
  category: string
  dueDate?: string
  priority?: string
  assignees?: Array<{ name: string; avatar?: string; initials?: string }>
  attachments?: number
  comments?: number
}

interface TaskDialogProps {
  isOpen: boolean
  onClose: () => void
  mode: 'create' | 'edit' | 'view'
  task?: Task
  onSave?: (task: Task) => void
}

const categories = [
  { value: 'design', label: 'Design' },
  { value: 'development', label: 'Development' },
  { value: 'research', label: 'Research' },
  { value: 'marketing', label: 'Marketing' }
]

const priorities = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
]

export default function TaskDialog({ isOpen, onClose, mode, task, onSave }: TaskDialogProps) {
  const [formData, setFormData] = useState<Task>({
    title: '',
    description: '',
    category: 'development',
    dueDate: '',
    priority: 'medium'
  })

  useEffect(() => {
    if (task && mode === 'edit') {
      setFormData(task)
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'development',
        dueDate: '',
        priority: 'medium'
      })
    }
  }, [task, mode])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSave) {
      onSave(formData)
    }
    onClose()
  }

  const handleChange = (field: keyof Task, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 opacity-100 transition-opacity duration-200">
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden transform scale-100 transition-transform duration-200">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <h2 className="text-lg font-semibold tracking-tight">
            {mode === 'create' ? 'สร้างงานใหม่' : mode === 'edit' ? 'แก้ไขงาน' : 'ดูรายละเอียดงาน'}
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="task-title" className="text-sm font-medium">
              ชื่องาน <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              id="task-title" 
              required 
              placeholder="เช่น อัปเดตโลโก้เว็บไซต์" 
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              disabled={mode === 'view'}
              className="w-full px-3 py-2 bg-transparent border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-slate-100 placeholder:text-slate-400 transition-shadow disabled:opacity-50"
            />
          </div>
          
          {/* Category & Due Date Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="task-category" className="text-sm font-medium">หมวดหมู่</label>
              <select 
                id="task-category" 
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                disabled={mode === 'view'}
                className="w-full px-3 py-2 bg-transparent border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-slate-100 [&>option]:text-slate-900 transition-shadow cursor-pointer disabled:opacity-50"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="task-date" className="text-sm font-medium">วันกำหนดส่ง</label>
              <input 
                type="date" 
                id="task-date" 
                value={formData.dueDate || ''}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                disabled={mode === 'view'}
                className="w-full px-3 py-2 bg-transparent border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-slate-100 [color-scheme:light_dark] transition-shadow cursor-pointer disabled:opacity-50"
              />
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <label htmlFor="task-priority" className="text-sm font-medium">ความสำคัญ</label>
            <select 
              id="task-priority" 
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
              disabled={mode === 'view'}
              className="w-full px-3 py-2 bg-transparent border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-slate-100 [&>option]:text-slate-900 transition-shadow cursor-pointer disabled:opacity-50"
            >
              {priorities.map(priority => (
                <option key={priority.value} value={priority.value}>{priority.label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="task-desc" className="text-sm font-medium">รายละเอียด</label>
            <textarea 
              id="task-desc" 
              rows={3} 
              placeholder="เพิ่มรายละเอียดของงานนี้..." 
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              disabled={mode === 'view'}
              className="w-full px-3 py-2 bg-transparent border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-slate-100 placeholder:text-slate-400 resize-none transition-shadow disabled:opacity-50"
            />
          </div>

          {/* Submit Buttons */}
          {mode !== 'view' && (
            <div className="pt-2 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primaryHover rounded-md shadow-sm transition-colors active:scale-95 flex items-center gap-2"
              >
                {mode === 'create' ? 'สร้างงาน' : 'บันทึกการแก้ไข'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
