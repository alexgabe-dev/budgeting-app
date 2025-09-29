"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DateRangePicker } from "@/components/date-range-picker"
import { FinancialSummary } from "@/components/financial-summary"
import { AdvancedCharts } from "@/components/advanced-charts"
import { ExportData } from "@/components/export-data"
import { SpendingCalendar } from "@/components/spending-calendar"
import { BudgetRuleProgress } from "@/components/budget-rule-progress"
import { DetailedMetrics } from "@/components/detailed-metrics"
import { useTransactionStore } from "@/lib/store"

export default function ReportsPage() {
  const { transactions, loadTransactions } = useTransactionStore()
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(),
  })

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setDateRange({ start: startDate, end: endDate })
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-muted-foreground">Comprehensive financial analysis and insights</p>
          </div>
          <DateRangePicker onDateRangeChange={handleDateRangeChange} />
        </div>

        <FinancialSummary transactions={transactions} dateRange={dateRange} />
        <BudgetRuleProgress />
        <DetailedMetrics transactions={transactions} dateRange={dateRange} />
        <SpendingCalendar transactions={transactions} dateRange={dateRange} />
        <AdvancedCharts transactions={transactions} dateRange={dateRange} />
        <ExportData transactions={transactions} dateRange={dateRange} />
      </main>
    </div>
  )
}
