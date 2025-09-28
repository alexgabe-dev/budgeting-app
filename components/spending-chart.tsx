"use client"

import { useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useTransactionStore } from "@/lib/store"
import { motion } from "framer-motion"

export function SpendingChart() {
  const { transactions, loadTransactions } = useTransactionStore()

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  const chartData = useMemo(() => {
    // Get last 6 months of data
    const months = []
    const currentDate = new Date()

    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthName = date.toLocaleDateString("en-US", { month: "short" })
      const year = date.getFullYear()

      // Calculate spending for this month
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const monthlySpending = transactions
        .filter((t) => {
          const transactionDate = new Date(t.date)
          return transactionDate >= monthStart && transactionDate <= monthEnd && t.amount < 0
        })
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      const monthlyIncome = transactions
        .filter((t) => {
          const transactionDate = new Date(t.date)
          return transactionDate >= monthStart && transactionDate <= monthEnd && t.amount > 0
        })
        .reduce((sum, t) => sum + t.amount, 0)

      months.push({
        name: monthName,
        spending: monthlySpending,
        income: monthlyIncome,
        net: monthlyIncome - monthlySpending,
      })
    }

    return months
  }, [transactions])

  const totalSpending = chartData.reduce((sum, month) => sum + month.spending, 0)
  const avgSpending = totalSpending / chartData.length

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Spending Trend</CardTitle>
          <CardDescription className="text-muted-foreground">
            Your spending and income pattern over the last 6 months
            {avgSpending > 0 && <span className="block mt-1">Average monthly spending: ${avgSpending.toFixed(2)}</span>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--popover-foreground))",
                }}
                formatter={(value: number, name: string) => [
                  `$${value.toFixed(2)}`,
                  name === "spending" ? "Spending" : name === "income" ? "Income" : "Net",
                ]}
              />
              <Line
                type="monotone"
                dataKey="spending"
                stroke="hsl(var(--chart-4))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-4))" }}
                name="spending"
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-1))" }}
                name="income"
              />
              <Line
                type="monotone"
                dataKey="net"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-2))" }}
                strokeDasharray="5 5"
                name="net"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  )
}
