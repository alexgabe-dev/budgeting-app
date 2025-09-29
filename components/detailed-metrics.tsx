"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar, 
  DollarSign, 
  CreditCard,
  PiggyBank,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react"
import type { Transaction } from "@/lib/database"
import { useSettingsStore, formatCurrency } from "@/lib/settings-store"
import { motion } from "framer-motion"

interface DetailedMetricsProps {
  transactions: Transaction[]
  dateRange: { start: Date; end: Date }
}

export function DetailedMetrics({ transactions, dateRange }: DetailedMetricsProps) {
  const { settings } = useSettingsStore()

  const metrics = useMemo(() => {
    const filteredTransactions = transactions.filter(
      (t) => new Date(t.date) >= dateRange.start && new Date(t.date) <= dateRange.end,
    )

    const totalIncome = filteredTransactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = Math.abs(filteredTransactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0))
    const netIncome = totalIncome - totalExpenses

    // Calculate spending patterns
    const dailySpending: Record<string, number> = {}
    const categorySpending: Record<string, number> = {}
    const monthlySpending: Record<string, number> = {}

    filteredTransactions
      .filter((t) => t.amount < 0)
      .forEach((t) => {
        const date = new Date(t.date)
        const dayKey = date.toISOString().split('T')[0]
        const monthKey = date.toISOString().substring(0, 7) // YYYY-MM

        dailySpending[dayKey] = (dailySpending[dayKey] || 0) + Math.abs(t.amount)
        categorySpending[t.category] = (categorySpending[t.category] || 0) + Math.abs(t.amount)
        monthlySpending[monthKey] = (monthlySpending[monthKey] || 0) + Math.abs(t.amount)
      })

    // Calculate averages and trends
    const daysWithSpending = Object.keys(dailySpending).length
    const avgDailySpending = daysWithSpending > 0 ? Object.values(dailySpending).reduce((sum, amount) => sum + amount, 0) / daysWithSpending : 0
    
    const totalDays = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const spendingFrequency = (daysWithSpending / totalDays) * 100

    // Find highest spending day
    const highestSpendingDay = Object.entries(dailySpending).reduce(
      (max, [day, amount]) => amount > max.amount ? { day, amount } : max,
      { day: "None", amount: 0 }
    )

    // Calculate category insights
    const topCategory = Object.entries(categorySpending).reduce(
      (max, [category, amount]) => amount > max.amount ? { category, amount } : max,
      { category: "None", amount: 0 }
    )

    const categoryCount = Object.keys(categorySpending).length
    const avgCategorySpending = categoryCount > 0 ? totalExpenses / categoryCount : 0

    // Calculate monthly trends
    const monthlyEntries = Object.entries(monthlySpending).sort(([a], [b]) => a.localeCompare(b))
    const spendingTrend = monthlyEntries.length > 1 
      ? ((monthlyEntries[monthlyEntries.length - 1][1] - monthlyEntries[0][1]) / monthlyEntries[0][1]) * 100
      : 0

    // Calculate savings insights
    const savingsRate = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0
    const isHealthySavings = savingsRate >= 20
    const isModerateSavings = savingsRate >= 10 && savingsRate < 20

    // Calculate transaction patterns
    const transactionCount = filteredTransactions.length
    const avgTransactionSize = transactionCount > 0 ? (totalIncome + totalExpenses) / transactionCount : 0
    const expenseTransactions = filteredTransactions.filter(t => t.amount < 0).length
    const incomeTransactions = filteredTransactions.filter(t => t.amount > 0).length

    return {
      totalIncome,
      totalExpenses,
      netIncome,
      savingsRate,
      isHealthySavings,
      isModerateSavings,
      avgDailySpending,
      spendingFrequency,
      highestSpendingDay,
      topCategory,
      categoryCount,
      avgCategorySpending,
      spendingTrend,
      transactionCount,
      avgTransactionSize,
      expenseTransactions,
      incomeTransactions,
      daysWithSpending,
      totalDays
    }
  }, [transactions, dateRange])

  const spendingInsights = [
    {
      title: "Spending Frequency",
      value: `${metrics.spendingFrequency.toFixed(1)}%`,
      description: "Days with transactions",
      icon: Calendar,
      color: metrics.spendingFrequency > 80 ? "text-green-600" : metrics.spendingFrequency > 50 ? "text-yellow-600" : "text-red-600",
      bgColor: metrics.spendingFrequency > 80 ? "bg-green-100" : metrics.spendingFrequency > 50 ? "bg-yellow-100" : "bg-red-100"
    },
    {
      title: "Average Daily Spending",
      value: formatCurrency(metrics.avgDailySpending, settings.currency, settings.showCents),
      description: "When you spend money",
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Highest Spending Day",
      value: formatCurrency(metrics.highestSpendingDay.amount, settings.currency, settings.showCents),
      description: metrics.highestSpendingDay.day !== "None" ? new Date(metrics.highestSpendingDay.day).toLocaleDateString() : "No spending",
      icon: TrendingUp,
      color: "text-red-600",
      bgColor: "bg-red-100"
    },
    {
      title: "Top Category",
      value: metrics.topCategory.category,
      description: formatCurrency(metrics.topCategory.amount, settings.currency, settings.showCents),
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ]

  const healthIndicators = [
    {
      title: "Savings Health",
      value: metrics.savingsRate.toFixed(1) + "%",
      status: metrics.isHealthySavings ? "excellent" : metrics.isModerateSavings ? "good" : "needs-improvement",
      icon: metrics.isHealthySavings ? CheckCircle : metrics.isModerateSavings ? Clock : AlertTriangle,
      description: metrics.isHealthySavings ? "Excellent savings rate!" : metrics.isModerateSavings ? "Good savings rate" : "Consider increasing savings"
    },
    {
      title: "Spending Trend",
      value: metrics.spendingTrend > 0 ? "+" + metrics.spendingTrend.toFixed(1) + "%" : metrics.spendingTrend.toFixed(1) + "%",
      status: metrics.spendingTrend < 0 ? "good" : metrics.spendingTrend < 10 ? "moderate" : "concerning",
      icon: metrics.spendingTrend < 0 ? TrendingDown : TrendingUp,
      description: metrics.spendingTrend < 0 ? "Spending is decreasing" : metrics.spendingTrend < 10 ? "Spending is stable" : "Spending is increasing"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Spending Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Spending Insights</CardTitle>
            <CardDescription>Detailed analysis of your spending patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {spendingInsights.map((insight, index) => {
                const Icon = insight.icon
                return (
                  <motion.div
                    key={insight.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-4 rounded-lg border"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full ${insight.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${insight.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">{insight.title}</p>
                        <p className={`text-lg font-bold ${insight.color}`}>{insight.value}</p>
                        <p className="text-xs text-muted-foreground">{insight.description}</p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Health Indicators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Financial Health Indicators</CardTitle>
            <CardDescription>Key metrics for your financial well-being</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {healthIndicators.map((indicator, index) => {
                const Icon = indicator.icon
                const statusColor = indicator.status === "excellent" || indicator.status === "good" 
                  ? "text-green-600" 
                  : indicator.status === "moderate" 
                  ? "text-yellow-600" 
                  : "text-red-600"
                
                const statusBgColor = indicator.status === "excellent" || indicator.status === "good" 
                  ? "bg-green-100" 
                  : indicator.status === "moderate" 
                  ? "bg-yellow-100" 
                  : "bg-red-100"

                return (
                  <motion.div
                    key={indicator.title}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className="p-4 rounded-lg border"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full ${statusBgColor} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${statusColor}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{indicator.title}</h3>
                          <Badge 
                            variant={indicator.status === "excellent" || indicator.status === "good" ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {indicator.status.replace("-", " ")}
                          </Badge>
                        </div>
                        <p className="text-2xl font-bold mb-1">{indicator.value}</p>
                        <p className="text-sm text-muted-foreground">{indicator.description}</p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Transaction Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Transaction Summary</CardTitle>
            <CardDescription>Overview of your transaction activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Total Transactions</span>
                </div>
                <p className="text-3xl font-bold">{metrics.transactionCount}</p>
                <p className="text-sm text-muted-foreground">
                  {metrics.expenseTransactions} expenses, {metrics.incomeTransactions} income
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Avg Transaction</span>
                </div>
                <p className="text-3xl font-bold">{formatCurrency(metrics.avgTransactionSize, settings.currency, settings.showCents)}</p>
                <p className="text-sm text-muted-foreground">Per transaction</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium">Categories Used</span>
                </div>
                <p className="text-3xl font-bold">{metrics.categoryCount}</p>
                <p className="text-sm text-muted-foreground">
                  Avg: {formatCurrency(metrics.avgCategorySpending, settings.currency, settings.showCents)} per category
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
