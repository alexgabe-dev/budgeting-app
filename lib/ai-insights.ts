import type { Transaction } from "./database"

export interface SpendingInsight {
  id: string
  type: "pattern" | "anomaly" | "suggestion" | "forecast"
  title: string
  description: string
  severity: "low" | "medium" | "high"
  category?: string
  amount?: number
  confidence: number
  actionable: boolean
  icon: string
}

export class AIInsightsEngine {
  private transactions: Transaction[]

  constructor(transactions: Transaction[]) {
    this.transactions = transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  generateInsights(): SpendingInsight[] {
    const insights: SpendingInsight[] = []

    // Add different types of insights
    insights.push(...this.analyzeSpendingPatterns())
    insights.push(...this.detectAnomalies())
    insights.push(...this.generateSuggestions())
    insights.push(...this.forecastSpending())

    // Sort by severity and confidence
    return insights
      .sort((a, b) => {
        const severityWeight = { high: 3, medium: 2, low: 1 }
        return severityWeight[b.severity] * b.confidence - severityWeight[a.severity] * a.confidence
      })
      .slice(0, 8) // Return top 8 insights
  }

  private analyzeSpendingPatterns(): SpendingInsight[] {
    const insights: SpendingInsight[] = []
    const expenses = this.transactions.filter((t) => t.amount < 0)

    if (expenses.length < 10) return insights

    // Analyze spending by day of week
    const daySpending = this.analyzeDayOfWeekSpending(expenses)
    const highestSpendingDay = Object.entries(daySpending).reduce((a, b) => (a[1] > b[1] ? a : b))

    if (highestSpendingDay[1] > 0) {
      insights.push({
        id: "day-pattern",
        type: "pattern",
        title: `You spend most on ${highestSpendingDay[0]}s`,
        description: `Your average ${highestSpendingDay[0]} spending is $${highestSpendingDay[1].toFixed(
          2,
        )}. Consider planning purchases for other days.`,
        severity: "low",
        confidence: 0.8,
        actionable: true,
        icon: "Calendar",
      })
    }

    // Analyze category trends
    const categoryTrends = this.analyzeCategoryTrends(expenses)
    const growingCategory = Object.entries(categoryTrends).find(([_, trend]) => trend.growth > 20)

    if (growingCategory) {
      insights.push({
        id: "category-growth",
        type: "pattern",
        title: `${growingCategory[0]} spending is increasing`,
        description: `Your ${growingCategory[0]} expenses have grown by ${growingCategory[1].growth.toFixed(
          1,
        )}% recently.`,
        severity: "medium",
        category: growingCategory[0],
        confidence: 0.85,
        actionable: true,
        icon: "TrendingUp",
      })
    }

    return insights
  }

  private detectAnomalies(): SpendingInsight[] {
    const insights: SpendingInsight[] = []
    const expenses = this.transactions.filter((t) => t.amount < 0)

    if (expenses.length < 5) return insights

    // Detect unusually large transactions
    const amounts = expenses.map((t) => Math.abs(t.amount))
    const mean = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length
    const stdDev = Math.sqrt(amounts.reduce((sum, amt) => sum + Math.pow(amt - mean, 2), 0) / amounts.length)

    const anomalies = expenses.filter((t) => Math.abs(t.amount) > mean + 2 * stdDev)

    if (anomalies.length > 0) {
      const largestAnomaly = anomalies.reduce((max, t) => (Math.abs(t.amount) > Math.abs(max.amount) ? t : max))

      insights.push({
        id: "large-expense",
        type: "anomaly",
        title: "Unusual large expense detected",
        description: `$${Math.abs(largestAnomaly.amount).toFixed(2)} for ${
          largestAnomaly.description
        } is significantly higher than your typical spending.`,
        severity: "high",
        amount: Math.abs(largestAnomaly.amount),
        category: largestAnomaly.category,
        confidence: 0.9,
        actionable: false,
        icon: "AlertTriangle",
      })
    }

    // Detect spending spikes
    const monthlySpending = this.getMonthlySpending(expenses)
    if (monthlySpending.length >= 2) {
      const currentMonth = monthlySpending[monthlySpending.length - 1]
      const previousMonth = monthlySpending[monthlySpending.length - 2]
      const increase = ((currentMonth.amount - previousMonth.amount) / previousMonth.amount) * 100

      if (increase > 30) {
        insights.push({
          id: "spending-spike",
          type: "anomaly",
          title: "Spending spike this month",
          description: `Your spending increased by ${increase.toFixed(
            1,
          )}% compared to last month. Current: $${currentMonth.amount.toFixed(2)}`,
          severity: "medium",
          confidence: 0.8,
          actionable: true,
          icon: "TrendingUp",
        })
      }
    }

    return insights
  }

  private generateSuggestions(): SpendingInsight[] {
    const insights: SpendingInsight[] = []
    const expenses = this.transactions.filter((t) => t.amount < 0)

    if (expenses.length < 5) return insights

    // Suggest budget optimization
    const categorySpending = this.getCategorySpending(expenses)
    const topCategory = Object.entries(categorySpending).reduce((a, b) => (a[1] > b[1] ? a : b))

    if (topCategory[1] > 200) {
      insights.push({
        id: "budget-optimization",
        type: "suggestion",
        title: `Consider reducing ${topCategory[0]} expenses`,
        description: `You've spent $${topCategory[1].toFixed(
          2,
        )} on ${topCategory[0]} recently. A 10% reduction could save you $${(topCategory[1] * 0.1).toFixed(2)}.`,
        severity: "medium",
        category: topCategory[0],
        confidence: 0.7,
        actionable: true,
        icon: "Target",
      })
    }

    // Suggest emergency fund
    const totalIncome = this.transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = Math.abs(expenses.reduce((sum, t) => sum + t.amount, 0))
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0

    if (savingsRate < 20 && totalIncome > 0) {
      insights.push({
        id: "emergency-fund",
        type: "suggestion",
        title: "Build your emergency fund",
        description: `Your current savings rate is ${savingsRate.toFixed(
          1,
        )}%. Aim for 20% to build financial security.`,
        severity: "medium",
        confidence: 0.85,
        actionable: true,
        icon: "Shield",
      })
    }

    return insights
  }

  private forecastSpending(): SpendingInsight[] {
    const insights: SpendingInsight[] = []
    const expenses = this.transactions.filter((t) => t.amount < 0)

    if (expenses.length < 10) return insights

    const monthlySpending = this.getMonthlySpending(expenses)
    if (monthlySpending.length >= 3) {
      // Simple linear trend analysis
      const trend = this.calculateTrend(monthlySpending.map((m) => m.amount))
      const lastMonthSpending = monthlySpending[monthlySpending.length - 1].amount
      const forecastedSpending = lastMonthSpending + trend

      if (Math.abs(trend) > 50) {
        insights.push({
          id: "spending-forecast",
          type: "forecast",
          title: "Next month spending forecast",
          description: `Based on your trend, you're likely to spend $${forecastedSpending.toFixed(
            2,
          )} next month (${trend > 0 ? "+" : ""}${trend.toFixed(2)} from this month).`,
          severity: trend > 100 ? "high" : "low",
          amount: forecastedSpending,
          confidence: 0.6,
          actionable: true,
          icon: "Crystal",
        })
      }
    }

    return insights
  }

  private analyzeDayOfWeekSpending(expenses: Transaction[]): Record<string, number> {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const daySpending: Record<string, number[]> = {}

    expenses.forEach((transaction) => {
      const day = dayNames[new Date(transaction.date).getDay()]
      if (!daySpending[day]) daySpending[day] = []
      daySpending[day].push(Math.abs(transaction.amount))
    })

    const averages: Record<string, number> = {}
    Object.entries(daySpending).forEach(([day, amounts]) => {
      averages[day] = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length
    })

    return averages
  }

  private analyzeCategoryTrends(expenses: Transaction[]): Record<string, { growth: number; current: number }> {
    const now = new Date()
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1)
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const oldPeriod = expenses.filter((t) => new Date(t.date) >= threeMonthsAgo && new Date(t.date) < oneMonthAgo)
    const newPeriod = expenses.filter((t) => new Date(t.date) >= oneMonthAgo)

    const oldSpending = this.getCategorySpending(oldPeriod)
    const newSpending = this.getCategorySpending(newPeriod)

    const trends: Record<string, { growth: number; current: number }> = {}

    Object.keys({ ...oldSpending, ...newSpending }).forEach((category) => {
      const oldAmount = oldSpending[category] || 0
      const newAmount = newSpending[category] || 0
      const growth = oldAmount > 0 ? ((newAmount - oldAmount) / oldAmount) * 100 : 0

      trends[category] = { growth, current: newAmount }
    })

    return trends
  }

  private getCategorySpending(expenses: Transaction[]): Record<string, number> {
    return expenses.reduce(
      (acc, transaction) => {
        acc[transaction.category] = (acc[transaction.category] || 0) + Math.abs(transaction.amount)
        return acc
      },
      {} as Record<string, number>,
    )
  }

  private getMonthlySpending(expenses: Transaction[]): { month: string; amount: number }[] {
    const monthlyData: Record<string, number> = {}

    expenses.forEach((transaction) => {
      const date = new Date(transaction.date)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + Math.abs(transaction.amount)
    })

    return Object.entries(monthlyData)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0

    const n = values.length
    const sumX = (n * (n - 1)) / 2
    const sumY = values.reduce((sum, val) => sum + val, 0)
    const sumXY = values.reduce((sum, val, index) => sum + index * val, 0)
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  }
}
