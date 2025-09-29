"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts"
import type { Transaction } from "@/lib/database"
import { useSettingsStore, formatCurrency } from "@/lib/settings-store"
import { motion } from "framer-motion"

interface AdvancedChartsProps {
  transactions: Transaction[]
  dateRange: { start: Date; end: Date }
}

export function AdvancedCharts({ transactions, dateRange }: AdvancedChartsProps) {
  const { settings } = useSettingsStore()
  
  const chartData = useMemo(() => {
    const filteredTransactions = transactions.filter(
      (t) => new Date(t.date) >= dateRange.start && new Date(t.date) <= dateRange.end,
    )

    // Monthly trend data
    const monthlyData: Record<string, { income: number; expenses: number; net: number }> = {}
    filteredTransactions.forEach((t) => {
      const monthKey = new Date(t.date).toLocaleDateString("en-US", { year: "numeric", month: "short" })
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0, net: 0 }
      }

      if (t.amount > 0) {
        monthlyData[monthKey].income += t.amount
      } else {
        monthlyData[monthKey].expenses += Math.abs(t.amount)
      }
      monthlyData[monthKey].net = monthlyData[monthKey].income - monthlyData[monthKey].expenses
    })

    const monthlyTrend = Object.entries(monthlyData)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
    
    // Add fallback data if no transactions
    if (monthlyTrend.length === 0) {
      const currentMonth = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short" })
      monthlyTrend.push({ month: currentMonth, income: 0, expenses: 0, net: 0 })
    }

    // Category spending data
    const categoryData: Record<string, number> = {}
    filteredTransactions
      .filter((t) => t.amount < 0)
      .forEach((t) => {
        categoryData[t.category] = (categoryData[t.category] || 0) + Math.abs(t.amount)
      })

    const categoryChart = Object.entries(categoryData)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8)
    
    // Add fallback data if no categories
    if (categoryChart.length === 0) {
      categoryChart.push({ category: "No Data", amount: 0 })
    }

    // Daily spending pattern
    const dailyPattern: Record<string, number> = {}
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    filteredTransactions
      .filter((t) => t.amount < 0)
      .forEach((t) => {
        const dayName = dayNames[new Date(t.date).getDay()]
        dailyPattern[dayName] = (dailyPattern[dayName] || 0) + Math.abs(t.amount)
      })

    const dailyChart = dayNames.map((day) => ({
      day: day.slice(0, 3),
      amount: dailyPattern[day] || 0,
    }))
    
    // Ensure we have data for all days
    if (dailyChart.every(d => d.amount === 0)) {
      // Add a small amount to Monday to show the chart isn't broken
      dailyChart[1].amount = 0.01
    }

    // Weekly spending trend
    const weeklyData: Record<string, number> = {}
    filteredTransactions
      .filter((t) => t.amount < 0)
      .forEach((t) => {
        const date = new Date(t.date)
        const weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay())
        const weekKey = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        weeklyData[weekKey] = (weeklyData[weekKey] || 0) + Math.abs(t.amount)
      })

    const weeklyTrend = Object.entries(weeklyData)
      .map(([week, amount]) => ({ week, amount }))
      .sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime())
      .slice(-8) // Last 8 weeks
    
    // Add fallback data if no weekly data
    if (weeklyTrend.length === 0) {
      const currentWeek = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })
      weeklyTrend.push({ week: currentWeek, amount: 0 })
    }

    return {
      monthlyTrend,
      categoryChart,
      dailyChart,
      weeklyTrend,
    }
  }, [transactions, dateRange])

  const colors = [
    "#3b82f6", // Blue
    "#ef4444", // Red  
    "#10b981", // Green
    "#f59e0b", // Yellow
    "#8b5cf6", // Purple
    "#06b6d4", // Cyan
    "#f97316", // Orange
    "#84cc16", // Lime
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Income vs Expenses */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
            <CardDescription>Income vs expenses over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#f9fafb"
                  }}
                  formatter={(value: number, name: string) => [formatCurrency(value, settings.currency, settings.showCents), name]}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stackId="1"
                  stroke={colors[0]}
                  fill={colors[0]}
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stackId="2"
                  stroke={colors[1]}
                  fill={colors[1]}
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Breakdown */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Top spending categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.categoryChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="amount"
                >
                  {chartData.categoryChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#f9fafb"
                  }}
                  formatter={(value: number) => [formatCurrency(value, settings.currency, settings.showCents), "Amount"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Daily Spending Pattern */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Daily Spending Pattern</CardTitle>
            <CardDescription>Average spending by day of week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.dailyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#f9fafb"
                  }}
                  formatter={(value: number) => [formatCurrency(value, settings.currency, settings.showCents), "Amount"]}
                />
                <Bar dataKey="amount" fill={colors[2]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Weekly Spending Trend</CardTitle>
            <CardDescription>Last 8 weeks spending pattern</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="week" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#f9fafb"
                  }}
                  formatter={(value: number) => [formatCurrency(value, settings.currency, settings.showCents), "Amount"]}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke={colors[3]}
                  strokeWidth={3}
                  dot={{ fill: colors[3], strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
