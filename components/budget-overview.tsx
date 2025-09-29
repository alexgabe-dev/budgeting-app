"use client"

import { useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useTransactionStore } from "@/lib/store"
import { useSettingsStore, formatCurrency } from "@/lib/settings-store"
import { motion } from "framer-motion"

export function BudgetOverview() {
  const { transactions, budgets, loadTransactions, loadBudgets, getBudgetProgress } = useTransactionStore()
  const { settings } = useSettingsStore()

  useEffect(() => {
    loadTransactions()
    loadBudgets()
  }, [loadTransactions, loadBudgets])

  const budgetData = useMemo(() => {
    if (budgets.length === 0) return []

    return budgets
      .map((budget) => {
        const progress = getBudgetProgress(budget.id!)
        return {
          category: budget.category,
          spent: progress.spent,
          budget: budget.amount,
          percentage: progress.percentage,
          period: budget.period,
        }
      })
      .filter((item) => item.spent > 0 || item.budget > 0)
      .sort((a, b) => b.percentage - a.percentage)
  }, [budgets, getBudgetProgress])

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
      <Card className="bg-card border-border h-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-foreground">Budget Overview</CardTitle>
          <CardDescription className="text-muted-foreground">
            {budgetData.length > 0 ? "Current budget progress by category" : "Create budgets to track your spending"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {budgetData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No budgets created yet.</p>
              <p className="text-sm mt-2">Create budgets to see your spending progress here.</p>
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
                      <span className="text-sm font-medium text-foreground">{item.category}</span>
                      <span className="text-xs text-muted-foreground">({item.period})</span>
                    </div>
                    <span className={`text-sm ${isOverBudget ? "text-destructive" : "text-muted-foreground"}`}>
                      {formatCurrency(item.spent, settings.currency, settings.showCents)} / {formatCurrency(item.budget, settings.currency, settings.showCents)}
                    </span>
                  </div>
                  <div className="relative">
                    <Progress value={Math.min(item.percentage, 100)} className="h-2" />
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
