import { getRecurringTemplates } from "@/lib/actions/recurring-task";
import RecurringList from "@/components/kanban/recurring-list";

export default async function RecurringPage() {
  const templates = await getRecurringTemplates();

  return <RecurringList initialTemplates={templates} />;
}
