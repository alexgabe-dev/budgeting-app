import { DashboardHeader } from "@/components/dashboard-header"
import { BudgetList } from "@/components/budget-list"
import { AddBudgetDialog } from "@/components/add-budget-dialog"

export default function BudgetsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Budget Management</h1>
            <p className="text-muted-foreground">Create and manage your spending budgets</p>
          </div>
          <AddBudgetDialog />
        </div>
        <BudgetList />
      </main>
    </div>
  )
}
