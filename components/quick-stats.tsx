"use client"

import { useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react"
import { useTransactionStore } from "@/lib/store"
import { motion } from "framer-motion"

export function QuickStats() {
  const { transactions, budgets, loadTransactions, loadBudgets } = useTransactionStore()

  useEffect(() => {
    loadTransactions()
    loadBudgets()
  }, [loadTransactions, loadBudgets])

  const stats = useMemo(() => {
    const currentMonth = new Date()
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

    const monthlyTransactions = transactions.filter(
      (t) => new Date(t.date) >= startOfMonth && new Date(t.date) <= endOfMonth,
    )

    const totalBalance = transactions.reduce((sum, t) => sum + t.amount, 0)
    const monthlySpending = monthlyTransactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const monthlyIncome = monthlyTransactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)

    // Calculate previous month for comparison
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    const prevMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0)
    const prevMonthTransactions = transactions.filter(
      (t) => new Date(t.date) >= prevMonth && new Date(t.date) <= prevMonthEnd,
    )
    const prevMonthSpending = prevMonthTransactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const spendingChange = prevMonthSpending > 0 ? ((monthlySpending - prevMonthSpending) / prevMonthSpending) * 100 : 0

    // Calculate total monthly budget from actual budgets
    const monthlyBudgets = budgets.filter(b => b.period === 'monthly')
    const totalMonthlyBudget = monthlyBudgets.reduce((sum, budget) => sum + budget.amount, 0)
    const budgetRemaining = totalMonthlyBudget - monthlySpending
    const budgetUsedPercentage = totalMonthlyBudget > 0 ? (monthlySpending / totalMonthlyBudget) * 100 : 0

    return [
      {
        title: "Total Balance",
        value: `$${totalBalance.toFixed(2)}`,
        change: totalBalance >= 0 ? "+0.0%" : "-0.0%",
        trend: totalBalance >= 0 ? "up" : "down",
        icon: DollarSign,
      },
      {
        title: "Monthly Spending",
        value: `$${monthlySpending.toFixed(2)}`,
        change: `${spendingChange >= 0 ? "+" : ""}${spendingChange.toFixed(1)}%`,
        trend: spendingChange <= 0 ? "down" : "up",
        icon: TrendingDown,
      },
      {
        title: "Budget Remaining",
        value: totalMonthlyBudget > 0 ? `$${budgetRemaining.toFixed(2)}` : "No budgets set",
        change: totalMonthlyBudget > 0 ? `${budgetUsedPercentage.toFixed(0)}% used` : "Create budgets to track",
        trend: totalMonthlyBudget > 0 ? (budgetUsedPercentage > 80 ? "up" : "neutral") : "neutral",
        icon: Target,
      },
      {
        title: "Monthly Income",
        value: `$${monthlyIncome.toFixed(2)}`,
        change: "This month",
        trend: "up",
        icon: TrendingUp,
      },
    ]
  }, [transactions, budgets])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <motion.div
                  className="text-2xl font-bold text-foreground"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                >
                  {stat.value}
                </motion.div>
                <p
                  className={`text-xs ${
                    stat.trend === "up"
                      ? "text-chart-1"
                      : stat.trend === "down"
                        ? "text-chart-2"
                        : "text-muted-foreground"
                  }`}
                >
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
