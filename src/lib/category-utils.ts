import type { CSSProperties } from "react";

// Type สำหรับ Category จาก DB
export interface CategoryRecord {
  id: string;
  name: string;
  color: string;
  includeInReport: boolean;
  isDefault: boolean;
  legacyKey: string | null;
}

// โครงสร้างของข้อมูล Category ที่จะส่งไปแสดงผลบน UI (เช่น Badge)
export interface CategoryInfo {
  text: string;
  classes: string;
  style?: CSSProperties;
}

/**
 * แปลง Category[] จาก DB ให้เป็น Record<string, CategoryInfo> เพื่อให้ UI แสดงผล
 * ใช้ได้ทั้ง category.id (UUID) และ legacyKey เป็น key
 * เพื่อให้รองรับทั้ง task เก่า (categoryId = "design") และ task ใหม่ (categoryId = UUID)
 */
export function categoriesToCategoryInfoMap(categories: CategoryRecord[]): Record<string, CategoryInfo> {
  const map: Record<string, CategoryInfo> = {};

  for (const cat of categories) {
    const categoryInfo: CategoryInfo = {
      text: cat.name,
      classes: generateCategoryClasses(cat.color),
      style: getCategoryStyle(cat.color),
    };

    // Map ด้วย id (UUID)
    map[cat.id] = categoryInfo;

    // Map ด้วย legacyKey ด้วย (สำหรับ task เก่าที่ยังใช้ key เดิม)
    if (cat.legacyKey) {
      map[cat.legacyKey] = categoryInfo;
    }
  }

  return map;
}

/**
 * สร้าง CSS classes จาก hex color สำหรับแสดง category badge
 */
function generateCategoryClasses(hexColor: string): string {
  return `border rounded-full`;
}

/**
 * สร้าง inline style object สำหรับ category badge
 */
export function getCategoryStyle(hexColor: string): CSSProperties {
  return {
    color: hexColor,
    backgroundColor: `${hexColor}15`,
    borderColor: `${hexColor}30`,
  };
}

/**
 * แปลง categories เป็น options สำหรับ dropdown/select
 */
export function categoriesToOptions(categories: CategoryRecord[]): { label: string; value: string }[] {
  return categories.map(cat => ({
    label: cat.name,
    value: cat.id,
  }));
}

