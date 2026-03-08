"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // รอให้ Component mount เสร็จก่อนถึงจะแสดงผล ป้องกันปัญหา Hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="text-muted-foreground shrink-0" disabled>
        <span className="sr-only">Toggle theme loading</span>
      </Button>
    )
  }

  // ใช้ resolvedTheme เพื่อดูว่าตอนนี้จริงๆ แล้วแสดงสีอะไรอยู่ (ครอบคลุมกรณีที่ theme="system")
  const isDarkMode = resolvedTheme === "dark"

  const toggleTheme = () => {
    setTheme(isDarkMode ? "light" : "dark")
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className="text-muted-foreground shrink-0" 
      title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {/* ซ่อน Sun เมื่อเป็น Light Mode / แสดงเมื่อเป็น Dark Mode */}
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      {/* ซ่อน Moon เมื่อเป็น Dark Mode / แสดงเมื่อเป็น Light Mode */}
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}