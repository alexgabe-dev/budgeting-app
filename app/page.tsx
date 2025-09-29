"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { QuickStats } from "@/components/quick-stats"
import { RecentTransactions } from "@/components/recent-transactions"
import { BudgetOverview } from "@/components/budget-overview"
import { SpendingBreakdownChart } from "@/components/spending-breakdown-chart"
import { CategorySpendingChart } from "@/components/category-spending-chart"
import { useSettingsStore } from "@/lib/settings-store"

export default function Dashboard() {
  const { settings } = useSettingsStore()
  const isCompact = settings.compactMode
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className={`container mx-auto px-4 ${isCompact ? 'py-4' : 'py-8'}`}>
          <div className={isCompact ? 'space-y-4' : 'space-y-8'}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-card border rounded-xl p-6 animate-pulse">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className={`container mx-auto px-4 ${isCompact ? 'py-4' : 'py-8'}`}>
        <div className={isCompact ? 'space-y-4' : 'space-y-8'}>
          {/* Quick Stats Section */}
          <section>
            <QuickStats />
          </section>
          
          {/* Charts Section */}
          <section className={`grid grid-cols-1 xl:grid-cols-2 ${isCompact ? 'gap-4' : 'gap-6'}`}>
            <SpendingBreakdownChart />
            <BudgetOverview />
          </section>
          
          {/* Transactions and Category Section */}
          <section className={`grid grid-cols-1 xl:grid-cols-3 ${isCompact ? 'gap-4' : 'gap-6'}`}>
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
