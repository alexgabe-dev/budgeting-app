"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { BudgetManagement } from "@/components/budget-management"

export default function BudgetsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <BudgetManagement />
      </main>
    </div>
  )
}
