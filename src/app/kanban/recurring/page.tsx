import { getRecurringTemplates } from "@/lib/actions/recurring-task";
import { getCategories } from "@/lib/actions/category";
import RecurringList from "@/components/kanban/recurring-list";

export default async function RecurringPage() {
  const templates = await getRecurringTemplates();
  const categories = await getCategories();

  return <RecurringList initialTemplates={templates} categories={categories} />;
}
