import SettingDashboard from "@/components/kanban/setting-dashboard";
import { getCategories } from "@/lib/actions/category";

export default async function Page() {
  const categories = await getCategories();

  return <SettingDashboard initialCategories={categories} />;
}