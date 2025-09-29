"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { useTransactionStore } from "@/lib/store"
import { useSettingsStore, formatCurrency } from "@/lib/settings-store"
import { motion } from "framer-motion"
import { ChevronDown, ChevronUp } from "lucide-react"

export function SpendingBreakdownChart() {
  const { transactions, categories, loadTransactions, loadCategories } = useTransactionStore()
  const { settings } = useSettingsStore()
  const isCompact = settings.compactMode
  const [showAllCategories, setShowAllCategories] = useState(false)

  useEffect(() => {
    loadTransactions()
    loadCategories()
  }, [loadTransactions, loadCategories])

  // Get category colors from the store
  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName)
    return category?.color || '#6C5CE7' // Default purple color
  }

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
        // Use dynamic colors from the store
        const color = getCategoryColor(category)
        return {
          name: category,
          value: amount,
          color: color,
          percentage: 0, // Will be calculated below
        }
      })
      .sort((a, b) => b.value - a.value)
      .map((item, _, array) => {
        const total = array.reduce((sum, cat) => sum + cat.value, 0)
        return {
          ...item,
          percentage: total > 0 ? (item.value / total) * 100 : 0,
        }
      })
  }, [transactions, categories])

  const totalSpending = chartData.reduce((sum, item) => sum + item.value, 0)
  
  // Show only top 3 categories initially, or all if showAllCategories is true
  const displayedCategories = showAllCategories ? chartData : chartData.slice(0, 3)
  const hasMoreCategories = chartData.length > 3

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
          <p className="text-xs text-muted-foreground">
            {data.percentage.toFixed(1)}% of total spending
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }: any) => {
    if (!payload) return null
    
    return (
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-1">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-muted-foreground">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
      <Card className="bg-card border-border h-full">
        <CardHeader className={isCompact ? "pb-2" : "pb-4"}>
          <CardTitle className={`${isCompact ? 'text-lg' : 'text-xl'} text-foreground`}>
            Spending Breakdown
          </CardTitle>
          <CardDescription className={`${isCompact ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
            This month's expenses by category
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
              <p className={`${isCompact ? 'text-xs' : 'text-sm'} mt-2`}>
                Add some expense transactions to see the breakdown.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={isCompact ? 200 : 280}>
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
                  <Legend content={<CustomLegend />} />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Category List */}
              <div className="space-y-3">
                <div className="space-y-2">
                  {displayedCategories.map((item, index) => (
                    <motion.div
                      key={item.name}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'} rounded-full border-2 border-background shadow-sm`}
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="flex flex-col">
                          <span className={`${isCompact ? 'text-sm' : 'text-base'} font-medium text-foreground`}>
                            {item.name}
                          </span>
                          <span className={`${isCompact ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                            {item.percentage.toFixed(1)}% of total
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`${isCompact ? 'text-sm' : 'text-base'} font-semibold text-foreground`}>
                          {formatCurrency(item.value, settings.currency, settings.showCents)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Show More/Less Button */}
                {hasMoreCategories && (
                  <div className="flex justify-center pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllCategories(!showAllCategories)}
                      className="flex items-center space-x-2"
                    >
                      {showAllCategories ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          <span>Show Less</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          <span>Show {chartData.length - 3} More</span>
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Summary for hidden categories */}
                {!showAllCategories && hasMoreCategories && (
                  <div className="text-center pt-2 border-t border-border">
                    <span className={`text-muted-foreground ${isCompact ? 'text-xs' : 'text-sm'}`}>
                      +{chartData.length - 3} more categories
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
