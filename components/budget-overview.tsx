"use client"

import { useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useTransactionStore } from "@/lib/store"
import { useSettingsStore, formatCurrency } from "@/lib/settings-store"
import { motion } from "framer-motion"

export function BudgetOverview() {
  const { transactions, budgetRules, loadTransactions, loadBudgetRules, getBudgetRuleProgress } = useTransactionStore()
  const { settings } = useSettingsStore()

  useEffect(() => {
    loadTransactions()
    loadBudgetRules()
  }, [loadTransactions, loadBudgetRules])

  const monthlyIncome = useMemo(() => {
    const currentMonth = new Date()
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

    return transactions
      .filter(t => t.amount > 0 && new Date(t.date) >= startOfMonth && new Date(t.date) <= endOfMonth)
      .reduce((sum, t) => sum + t.amount, 0)
  }, [transactions])

  const budgetData = useMemo(() => {
    if (budgetRules.length === 0 || monthlyIncome === 0) return []

    return budgetRules
      .map((rule) => {
        const progress = getBudgetRuleProgress(rule.id!, monthlyIncome)
        return {
          category: rule.name,
          spent: progress.spent,
          budget: progress.budget,
          percentage: progress.percentage,
          period: "monthly",
          color: rule.color,
        }
      })
      .filter((item) => item.budget > 0)
      .sort((a, b) => b.percentage - a.percentage)
  }, [budgetRules, monthlyIncome, getBudgetRuleProgress])

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
      <Card className="bg-card border-border h-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-foreground">Budget Overview</CardTitle>
          <CardDescription className="text-muted-foreground">
            {budgetData.length > 0 ? "Current 50/30/20 rule progress" : "Add income transactions to see budget rule progress"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {budgetData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No budget rule data available.</p>
              <p className="text-sm mt-2">Add income transactions to see your 50/30/20 rule progress here.</p>
            </div>
          ) : (
            budgetData.map((item, index) => {
              const isOverBudget = item.percentage > 100

              return (
                <motion.div
                  key={item.category}
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium text-foreground">{item.category}</span>
                      <span className="text-xs text-muted-foreground">({item.period})</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {formatCurrency(item.spent, settings.currency, settings.showCents)} / {formatCurrency(item.budget, settings.currency, settings.showCents)}
                      </div>
                      <div className={`text-xs ${isOverBudget ? "text-destructive" : "text-muted-foreground"}`}>
                        {item.percentage.toFixed(0)}% used
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <Progress 
                      value={Math.min(item.percentage, 100)} 
                      className="h-2"
                      style={!isOverBudget ? { "--progress-color": item.color } as React.CSSProperties : undefined}
                    />
                    {isOverBudget && (
                      <div className="absolute top-0 left-0 w-full h-2 bg-destructive/20 rounded-full">
                        <div
                          className="h-full bg-destructive rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((item.percentage - 100) * 2, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                  {isOverBudget && (
                    <p className="text-xs text-destructive">Over budget by {formatCurrency(item.spent - item.budget, settings.currency, settings.showCents)}</p>
                  )}
                </motion.div>
              )
            })
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
