import { DashboardHeader } from "@/components/dashboard-header"
import { QuickStats } from "@/components/quick-stats"
import { RecentTransactions } from "@/components/recent-transactions"
import { BudgetOverview } from "@/components/budget-overview"
import { SpendingChart } from "@/components/spending-chart"
import { CategorySpendingChart } from "@/components/category-spending-chart"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Quick Stats Section */}
          <section>
            <QuickStats />
          </section>
          
          {/* Charts Section */}
          <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <SpendingChart />
            <BudgetOverview />
          </section>
          
          {/* Transactions and Category Section */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <RecentTransactions />
            </div>
            <div className="xl:col-span-1">
              <CategorySpendingChart />
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
