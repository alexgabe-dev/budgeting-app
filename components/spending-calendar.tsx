"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { ChevronLeft, ChevronRight, DollarSign, TrendingUp, TrendingDown } from "lucide-react"
import type { Transaction } from "@/lib/database"
import { useSettingsStore, formatCurrency } from "@/lib/settings-store"
import { motion } from "framer-motion"

interface SpendingCalendarProps {
  transactions: Transaction[]
  dateRange: { start: Date; end: Date }
}

export function SpendingCalendar({ transactions, dateRange }: SpendingCalendarProps) {
  const { settings } = useSettingsStore()
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const calendarData = useMemo(() => {
    const filteredTransactions = transactions.filter(
      (t) => new Date(t.date) >= dateRange.start && new Date(t.date) <= dateRange.end,
    )

    // Group transactions by date
    const dailySpending: Record<string, { income: number; expenses: number; net: number; count: number }> = {}
    
    filteredTransactions.forEach((t) => {
      const dateKey = new Date(t.date).toISOString().split('T')[0]
      if (!dailySpending[dateKey]) {
        dailySpending[dateKey] = { income: 0, expenses: 0, net: 0, count: 0 }
      }
      
      dailySpending[dateKey].count++
      if (t.amount > 0) {
        dailySpending[dateKey].income += t.amount
      } else {
        dailySpending[dateKey].expenses += Math.abs(t.amount)
      }
      dailySpending[dateKey].net = dailySpending[dateKey].income - dailySpending[dateKey].expenses
    })

    return dailySpending
  }, [transactions, dateRange])

  const getSpendingForDate = (date: Date | undefined) => {
    if (!date) return { income: 0, expenses: 0, net: 0, count: 0 }
    const dateKey = date.toISOString().split('T')[0]
    return calendarData[dateKey] || { income: 0, expenses: 0, net: 0, count: 0 }
  }

  const getSpendingColor = (spending: { income: number; expenses: number; net: number; count: number }) => {
    if (spending.count === 0) return "text-muted-foreground"
    if (spending.net > 0) return "text-green-600"
    if (spending.net < 0) return "text-red-600"
    return "text-muted-foreground"
  }

  const getSpendingIntensity = (spending: { income: number; expenses: number; net: number; count: number }) => {
    if (spending.count === 0) return "bg-muted/20"
    if (spending.expenses > 100) return "bg-red-500/30"
    if (spending.expenses > 50) return "bg-red-400/20"
    if (spending.expenses > 20) return "bg-red-300/10"
    return "bg-green-100/50"
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth)
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1)
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1)
    }
    setCurrentMonth(newMonth)
  }

  const monthStats = useMemo(() => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
    
    const monthTransactions = transactions.filter(
      (t) => new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd
    )

    const totalIncome = monthTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = Math.abs(monthTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0))
    const netIncome = totalIncome - totalExpenses
    const transactionCount = monthTransactions.length

    return { totalIncome, totalExpenses, netIncome, transactionCount }
  }, [transactions, currentMonth])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Spending Calendar</CardTitle>
              <CardDescription>
                Daily spending patterns and transaction activity
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[120px] text-center">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Month Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Income</span>
                </div>
                <p className="text-lg font-bold">{formatCurrency(monthStats.totalIncome, settings.currency, settings.showCents)}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-600">Expenses</span>
                </div>
                <p className="text-lg font-bold">{formatCurrency(monthStats.totalExpenses, settings.currency, settings.showCents)}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">Net</span>
                </div>
                <p className={`text-lg font-bold ${monthStats.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(monthStats.netIncome, settings.currency, settings.showCents)}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <span className="text-sm font-medium text-muted-foreground">Transactions</span>
                </div>
                <p className="text-lg font-bold">{monthStats.transactionCount}</p>
              </div>
            </div>

            {/* Calendar */}
            <div className="border rounded-lg p-4">
              {/* Month/Year Header */}
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
              </div>
              
              {/* Custom calendar grid with spending data */}
              <div className="grid grid-cols-7 gap-1">
                {/* Day headers */}
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {(() => {
                  const year = currentMonth.getFullYear()
                  const month = currentMonth.getMonth()
                  const firstDay = new Date(year, month, 1)
                  const lastDay = new Date(year, month + 1, 0)
                  
                  // Start from the first day of the week containing the first day of the month
                  const startDate = new Date(firstDay)
                  startDate.setDate(startDate.getDate() - firstDay.getDay())
                  
                  const days = []
                  const today = new Date()
                  
                  for (let i = 0; i < 42; i++) {
                    const date = new Date(startDate)
                    date.setDate(startDate.getDate() + i)
                    const isCurrentMonth = date.getMonth() === month
                    const isToday = date.toDateString() === today.toDateString()
                    const spending = getSpendingForDate(date)
                    
                    days.push(
                      <div
                        key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
                        className={`relative min-h-[80px] p-2 rounded-md border transition-colors ${
                          isCurrentMonth 
                            ? 'bg-background hover:bg-accent' 
                            : 'bg-muted/20 opacity-50'
                        } ${isToday ? 'ring-2 ring-primary bg-primary/10' : ''}`}
                      >
                        <div className="flex flex-col h-full">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">
                              {date.getDate()}
                            </span>
                            {isToday && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                          </div>
                          
                          <div className="flex-1 flex flex-col justify-end space-y-1">
                            {spending.count > 0 && (
                              <>
                                {spending.expenses > 0 && (
                                  <div className="text-xs px-1 py-0.5 rounded bg-red-100 dark:bg-red-900/30">
                                    <span className="text-red-600 dark:text-red-400 font-medium">
                                      -{formatCurrency(spending.expenses, settings.currency, false)}
                                    </span>
                                  </div>
                                )}
                                {spending.income > 0 && (
                                  <div className="text-xs px-1 py-0.5 rounded bg-green-100 dark:bg-green-900/30">
                                    <span className="text-green-600 dark:text-green-400 font-medium">
                                      +{formatCurrency(spending.income, settings.currency, false)}
                                    </span>
                                  </div>
                                )}
                                <div className="text-xs text-center">
                                  <Badge variant="outline" className="text-xs">
                                    {spending.count}
                                  </Badge>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return days
                })()}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center space-x-6 text-sm mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800"></div>
                <span>Expenses</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800"></div>
                <span>Income</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-muted/20 border border-muted"></div>
                <span>No Activity</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
