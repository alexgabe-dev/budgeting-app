"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react"
import type { Transaction } from "@/lib/database"
import { useSettingsStore, formatCurrency } from "@/lib/settings-store"
import { motion } from "framer-motion"

interface FinancialSummaryProps {
  transactions: Transaction[]
  dateRange: { start: Date; end: Date }
}

export function FinancialSummary({ transactions, dateRange }: FinancialSummaryProps) {
  const { settings } = useSettingsStore()
  
  const summary = useMemo(() => {
    const filteredTransactions = transactions.filter(
      (t) => new Date(t.date) >= dateRange.start && new Date(t.date) <= dateRange.end,
    )

    const totalIncome = filteredTransactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = Math.abs(
      filteredTransactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0),
    )
    const netIncome = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0

    // Category breakdown
    const categorySpending: Record<string, number> = {}
    filteredTransactions
      .filter((t) => t.amount < 0)
      .forEach((t) => {
        categorySpending[t.category] = (categorySpending[t.category] || 0) + Math.abs(t.amount)
      })

    const topCategory = Object.entries(categorySpending).reduce(
      (max, [category, amount]) => (amount > max.amount ? { category, amount } : max),
      { category: "None", amount: 0 },
    )

    // Transaction count
    const transactionCount = filteredTransactions.length
    const expenseTransactions = filteredTransactions.filter((t) => t.amount < 0)
    const avgTransactionSize =
      expenseTransactions.length > 0 ? totalExpenses / expenseTransactions.length : 0

    return {
      totalIncome,
      totalExpenses,
      netIncome,
      savingsRate,
      topCategory,
      transactionCount,
      avgTransactionSize,
      categoryCount: Object.keys(categorySpending).length,
    }
  }, [transactions, dateRange])

  const summaryCards = [
    {
      title: "Total Income",
      value: formatCurrency(summary.totalIncome, settings.currency, settings.showCents),
      icon: TrendingUp,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
    {
      title: "Total Expenses",
      value: formatCurrency(summary.totalExpenses, settings.currency, settings.showCents),
      icon: TrendingDown,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
    {
      title: "Net Income",
      value: formatCurrency(summary.netIncome, settings.currency, settings.showCents),
      icon: DollarSign,
      color: summary.netIncome >= 0 ? "text-chart-1" : "text-destructive",
      bgColor: summary.netIncome >= 0 ? "bg-chart-1/10" : "bg-destructive/10",
    },
    {
      title: "Savings Rate",
      value: `${summary.savingsRate.toFixed(1)}%`,
      icon: PieChart,
      color:
        summary.savingsRate >= 20 ? "text-chart-1" : summary.savingsRate >= 10 ? "text-chart-4" : "text-destructive",
      bgColor:
        summary.savingsRate >= 20 ? "bg-chart-1/10" : summary.savingsRate >= 10 ? "bg-chart-4/10" : "bg-destructive/10",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{card.title}</p>
                      <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-full ${card.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${card.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Detailed Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle>Period Summary</CardTitle>
            <CardDescription>
              {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Transaction Count</p>
                <p className="text-2xl font-bold text-foreground">{summary.transactionCount}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Avg Transaction</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(summary.avgTransactionSize, settings.currency, settings.showCents)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Categories Used</p>
                <p className="text-2xl font-bold text-foreground">{summary.categoryCount}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Top Category</p>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{summary.topCategory.category}</Badge>
                  <span className="text-sm text-muted-foreground">{formatCurrency(summary.topCategory.amount, settings.currency, settings.showCents)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
