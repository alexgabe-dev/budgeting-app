"use client"

import { useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Heart, TrendingUp, Shield, Target } from "lucide-react"
import { useTransactionStore } from "@/lib/store"
import { motion } from "framer-motion"

export function FinancialHealthScore() {
  const { transactions, budgets, loadTransactions, loadBudgets, getBudgetProgress } = useTransactionStore()

  useEffect(() => {
    loadTransactions()
    loadBudgets()
  }, [loadTransactions, loadBudgets])

  const healthMetrics = useMemo(() => {
    if (transactions.length === 0) {
      return {
        overallScore: 0,
        savingsRate: 0,
        spendingConsistency: 0,
        budgetAdherence: 0,
        diversification: 0,
      }
    }

    const currentMonth = new Date()
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

    const monthlyTransactions = transactions.filter(
      (t) => new Date(t.date) >= startOfMonth && new Date(t.date) <= endOfMonth,
    )

    const monthlyIncome = monthlyTransactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
    const monthlyExpenses = Math.abs(
      monthlyTransactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0),
    )

    // Calculate savings rate (0-100)
    const savingsRate = monthlyIncome > 0 ? Math.min(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100, 100) : 0

    // Calculate spending consistency (variance in daily spending)
    const dailySpending: Record<string, number> = {}
    monthlyTransactions
      .filter((t) => t.amount < 0)
      .forEach((t) => {
        const day = new Date(t.date).toDateString()
        dailySpending[day] = (dailySpending[day] || 0) + Math.abs(t.amount)
      })

    const spendingValues = Object.values(dailySpending)
    const avgDailySpending = spendingValues.reduce((sum, val) => sum + val, 0) / spendingValues.length
    const variance =
      spendingValues.reduce((sum, val) => sum + Math.pow(val - avgDailySpending, 2), 0) / spendingValues.length
    const spendingConsistency = Math.max(0, 100 - (Math.sqrt(variance) / avgDailySpending) * 100)

    let budgetAdherence = 100 // Default to 100 if no budgets
    if (budgets.length > 0) {
      const budgetScores = budgets.map((budget) => {
        const progress = getBudgetProgress(budget.id!)
        return Math.max(0, 100 - Math.max(0, progress.percentage - 100)) // Penalize over-budget
      })
      budgetAdherence = budgetScores.reduce((sum, score) => sum + score, 0) / budgetScores.length
    }

    // Calculate category diversification
    const categories = new Set(monthlyTransactions.filter((t) => t.amount < 0).map((t) => t.category))
    const diversification = Math.min((categories.size / 6) * 100, 100) // Assume 6 is ideal number of categories

    // Overall score (weighted average)
    const overallScore = Math.round(
      savingsRate * 0.3 + spendingConsistency * 0.2 + budgetAdherence * 0.3 + diversification * 0.2,
    )

    return {
      overallScore,
      savingsRate: Math.round(savingsRate),
      spendingConsistency: Math.round(spendingConsistency),
      budgetAdherence: Math.round(budgetAdherence),
      diversification: Math.round(diversification),
    }
  }, [transactions, budgets, getBudgetProgress])

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-chart-1"
    if (score >= 60) return "text-chart-4"
    if (score >= 40) return "text-chart-5"
    return "text-destructive"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { variant: "default" as const, label: "Excellent" }
    if (score >= 60) return { variant: "secondary" as const, label: "Good" }
    if (score >= 40) return { variant: "outline" as const, label: "Fair" }
    return { variant: "destructive" as const, label: "Needs Work" }
  }

  const metrics = [
    {
      name: "Savings Rate",
      score: healthMetrics.savingsRate,
      icon: TrendingUp,
      description: "How much you save vs spend",
    },
    {
      name: "Spending Consistency",
      score: healthMetrics.spendingConsistency,
      icon: Target,
      description: "How consistent your daily spending is",
    },
    {
      name: "Budget Adherence",
      score: healthMetrics.budgetAdherence,
      icon: Shield,
      description: "How well you stick to your budget",
    },
    {
      name: "Category Diversification",
      score: healthMetrics.diversification,
      icon: Heart,
      description: "How balanced your spending categories are",
    },
  ]

  const scoreBadge = getScoreBadge(healthMetrics.overallScore)

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-primary" />
              <CardTitle className="text-foreground">Financial Health Score</CardTitle>
            </div>
            <Badge variant={scoreBadge.variant}>{scoreBadge.label}</Badge>
          </div>
          <CardDescription className="text-muted-foreground">
            AI-powered assessment of your financial wellness
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="text-center">
              <motion.div
                className={`text-4xl font-bold ${getScoreColor(healthMetrics.overallScore)}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {healthMetrics.overallScore}
              </motion.div>
              <p className="text-sm text-muted-foreground mt-1">Overall Health Score</p>
              <Progress value={healthMetrics.overallScore} className="mt-3" />
            </div>

            {/* Individual Metrics */}
            <div className="space-y-4">
              {metrics.map((metric, index) => {
                const Icon = metric.icon
                return (
                  <motion.div
                    key={metric.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 + 0.3 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{metric.name}</p>
                        <p className="text-xs text-muted-foreground">{metric.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-semibold ${getScoreColor(metric.score)}`}>{metric.score}</span>
                      <span className="text-xs text-muted-foreground">/100</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {transactions.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">Add transactions to calculate your financial health score</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
