"use client"

import { useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { useTransactionStore } from "@/lib/store"
import { motion } from "framer-motion"

export function CategorySpendingChart() {
  const { transactions, categories, loadTransactions, loadCategories } = useTransactionStore()

  useEffect(() => {
    loadTransactions()
    loadCategories()
  }, [loadTransactions, loadCategories])

  const chartData = useMemo(() => {
    const currentMonth = new Date()
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

    const monthlyExpenses = transactions.filter(
      (t) => new Date(t.date) >= startOfMonth && new Date(t.date) <= endOfMonth && t.amount < 0,
    )

    const categoryTotals = monthlyExpenses.reduce(
      (acc, transaction) => {
        const category = transaction.category
        acc[category] = (acc[category] || 0) + Math.abs(transaction.amount)
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(categoryTotals)
      .map(([category, amount]) => {
        const categoryData = categories.find((c) => c.name === category)
        return {
          name: category,
          value: amount,
          color: categoryData?.color || "hsl(var(--chart-1))",
        }
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 6) // Show top 6 categories
  }, [transactions, categories])

  const totalSpending = chartData.reduce((sum, item) => sum + item.value, 0)

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Spending by Category</CardTitle>
          <CardDescription className="text-muted-foreground">
            This month's expenses breakdown
            {totalSpending > 0 && <span className="block mt-1">Total: ${totalSpending.toFixed(2)}</span>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No expense data for this month.</p>
              <p className="text-sm mt-2">Add some expense transactions to see the breakdown.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--popover-foreground))",
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Amount"]}
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: "20px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
