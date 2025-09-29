"use client"

import { useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { useTransactionStore } from "@/lib/store"
import { useSettingsStore, formatCurrency } from "@/lib/settings-store"
import { motion } from "framer-motion"

export function CategorySpendingChart() {
  const { transactions, categories, loadTransactions, loadCategories } = useTransactionStore()
  const { settings } = useSettingsStore()
  const isCompact = settings.compactMode

  // Define vibrant colors for all categories
  const categoryColors = {
    // Food & Dining
    'Food': '#FF6B6B', // Red
    'Food & Dining': '#FF6B6B', // Red
    'Groceries': '#FF8A80', // Light Red
    'Restaurants': '#FFAB91', // Orange Red
    
    // Transportation
    'Transport': '#45B7D1', // Blue
    'Transportation': '#45B7D1', // Blue
    'Gas': '#64B5F6', // Light Blue
    'Public Transport': '#90CAF9', // Lighter Blue
    'Car': '#BBDEFB', // Very Light Blue
    
    // Entertainment
    'Entertainment': '#4ECDC4', // Teal
    'Movies': '#26A69A', // Dark Teal
    'Games': '#4DB6AC', // Medium Teal
    'Sports': '#80CBC4', // Light Teal
    'Music': '#B2DFDB', // Very Light Teal
    
    // Shopping
    'Shopping': '#96CEB4', // Green
    'Clothes': '#81C784', // Medium Green
    'Electronics': '#A5D6A7', // Light Green
    'Shopping Books': '#C8E6C9', // Very Light Green
    'Online Shopping': '#E8F5E8', // Ultra Light Green
    
    // Bills & Utilities
    'Bills': '#85C1E9', // Light Blue
    'Bills & Utilities': '#85C1E9', // Light Blue
    'Utilities': '#98D8C8', // Mint
    'Electricity': '#AED6F1', // Light Blue
    'Water': '#D6EAF8', // Very Light Blue
    'Internet': '#EBF5FB', // Ultra Light Blue
    'Phone': '#F4F6F7', // Almost White Blue
    
    // Healthcare
    'Healthcare': '#FFEAA7', // Yellow
    'Medical': '#F7DC6F', // Gold
    'Pharmacy': '#FCF3CF', // Light Yellow
    'Dental': '#FEF9E7', // Very Light Yellow
    'Insurance': '#FDFEFE', // Almost White Yellow
    
    // Education
    'Education': '#DDA0DD', // Plum
    'School': '#BB8FCE', // Lavender
    'Courses': '#D7BDE2', // Light Purple
    'Education Books': '#E8DAEF', // Very Light Purple
    
    // Travel
    'Travel': '#F7DC6F', // Gold
    'Vacation': '#F8C471', // Orange
    'Hotels': '#FADBD8', // Light Orange
    'Flights': '#FDEBD0', // Very Light Orange
    
    // Income
    'Salary': '#82E0AA', // Light Green
    'Income': '#82E0AA', // Light Green
    'Bonus': '#A9DFBF', // Light Green
    'Investment': '#D5F4E6', // Very Light Green
    
    // Other
    'Other': '#F8C471', // Orange
    'Miscellaneous': '#F8C471', // Orange
    'Gifts': '#FAD7A0', // Light Orange
    'Donations': '#FCF3CF', // Very Light Orange
  }

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
        // Use predefined colors or fallback to a default color
        const color = categoryColors[category as keyof typeof categoryColors] || '#6C5CE7'
        return {
          name: category,
          value: amount,
          color: color,
        }
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 6) // Show top 6 categories
  }, [transactions, categories])

  const totalSpending = chartData.reduce((sum, item) => sum + item.value, 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <div className="flex items-center space-x-2 mb-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.color }}
            />
            <p className="font-medium text-foreground">{data.name}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(data.value, settings.currency, settings.showCents)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
      <Card className="bg-card border-border h-full">
        <CardHeader className={isCompact ? "pb-2" : "pb-4"}>
          <CardTitle className={`${isCompact ? 'text-lg' : 'text-xl'} text-foreground`}>Spending by Category</CardTitle>
          <CardDescription className={`${isCompact ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
            This month's expenses breakdown
            {totalSpending > 0 && (
              <span className={`block ${isCompact ? 'mt-0.5' : 'mt-1'} ${isCompact ? 'text-xs' : 'text-sm'}`}>
                Total: {formatCurrency(totalSpending, settings.currency, settings.showCents)}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {chartData.length === 0 ? (
            <div className={`text-center ${isCompact ? 'py-4' : 'py-8'} text-muted-foreground`}>
              <p className={isCompact ? 'text-sm' : 'text-base'}>No expense data for this month.</p>
              <p className={`${isCompact ? 'text-xs' : 'text-sm'} mt-2`}>Add some expense transactions to see the breakdown.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={isCompact ? 240 : 320}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={isCompact ? 40 : 60}
                  outerRadius={isCompact ? 80 : 120}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{
                    paddingTop: "20px",
                    fontSize: isCompact ? "10px" : "12px",
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
