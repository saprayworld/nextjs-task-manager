import { Tag } from "@/components/kanban/kanban-board";

// Type สำหรับ Category จาก DB
export interface CategoryRecord {
  id: string;
  name: string;
  color: string;
  includeInReport: boolean;
  isDefault: boolean;
  legacyKey: string | null;
}

/**
 * แปลง Category[] จาก DB ให้เป็น Record<string, Tag> format เดิมที่ UI ใช้
 * ใช้ได้ทั้ง category.id (UUID) และ legacyKey เป็น key
 * เพื่อให้รองรับทั้ง task เก่า (categoryId = "design") และ task ใหม่ (categoryId = UUID)
 */
export function categoriesToTagMap(categories: CategoryRecord[]): Record<string, Tag> {
  const map: Record<string, Tag> = {};

  for (const cat of categories) {
    const tag: Tag = {
      text: cat.name,
      classes: generateTagClasses(cat.color),
    };

    // Map ด้วย id (UUID)
    map[cat.id] = tag;

    // Map ด้วย legacyKey ด้วย (สำหรับ task เก่าที่ยังใช้ key เดิม)
    if (cat.legacyKey) {
      map[cat.legacyKey] = tag;
    }
  }

  return map;
}

/**
 * สร้าง CSS classes จาก hex color สำหรับแสดง tag badge
 * ใช้ inline color variable แทน Tailwind classes เพื่อรองรับสีจาก DB
 */
function generateTagClasses(hexColor: string): string {
  return `border rounded-full`;
}

/**
 * สร้าง inline style object สำหรับ tag badge
 * ใช้คู่กับ classes จาก generateTagClasses
 */
export function getTagStyle(hexColor: string): React.CSSProperties {
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
