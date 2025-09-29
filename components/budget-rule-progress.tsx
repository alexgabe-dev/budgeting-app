"use client"

import { useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useTransactionStore } from "@/lib/store"
import { useSettingsStore, formatCurrency } from "@/lib/settings-store"
import { motion } from "framer-motion"
import { Home, ShoppingBag, PiggyBank, DollarSign } from "lucide-react"

export function BudgetRuleProgress() {
  const { budgetRules, transactions, loadBudgetRules, loadTransactions, getBudgetRuleProgress } = useTransactionStore()
  const { settings } = useSettingsStore()

  useEffect(() => {
    loadBudgetRules()
    loadTransactions()
  }, [loadBudgetRules, loadTransactions])

  const monthlyIncome = useMemo(() => {
    const currentMonth = new Date()
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

    return transactions
      .filter(t => t.amount > 0 && new Date(t.date) >= startOfMonth && new Date(t.date) <= endOfMonth)
      .reduce((sum, t) => sum + t.amount, 0)
  }, [transactions])

  const budgetRuleData = useMemo(() => {
    return budgetRules.map(rule => {
      const progress = getBudgetRuleProgress(rule.id!, monthlyIncome)
      return {
        ...rule,
        ...progress,
        isOverBudget: progress.percentage > 100,
        isNearLimit: progress.percentage > 80
      }
    }).sort((a, b) => a.percentage - b.percentage)
  }, [budgetRules, monthlyIncome, getBudgetRuleProgress])

  const getRuleIcon = (ruleName: string) => {
    switch (ruleName.toLowerCase()) {
      case "needs":
        return <Home className="h-4 w-4" />
      case "wants":
        return <ShoppingBag className="h-4 w-4" />
      case "savings":
        return <PiggyBank className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const getRuleColor = (ruleName: string) => {
    switch (ruleName.toLowerCase()) {
      case "needs":
        return "text-red-500"
      case "wants":
        return "text-blue-500"
      case "savings":
        return "text-green-500"
      default:
        return "text-gray-500"
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage > 100) return "bg-red-500"
    if (percentage > 80) return "bg-orange-500"
    return "bg-green-500"
  }

  if (monthlyIncome === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Budget Rule Progress</span>
          </CardTitle>
          <CardDescription>
            Track your spending against the 50/30/20 rule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No income data for this month.</p>
            <p className="text-sm">Add income transactions to see budget rule progress.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Budget Rule Progress</span>
          </CardTitle>
          <CardDescription>
            Track your spending against the 50/30/20 rule this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Monthly Income Summary */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Monthly Income</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(monthlyIncome, settings.currency, settings.showCents)}
                  </p>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  This Month
                </Badge>
              </div>
            </div>

            {/* Budget Rule Progress */}
            <div className="space-y-4">
              {budgetRuleData.map((rule, index) => (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full bg-muted ${getRuleColor(rule.name)}`}>
                        {getRuleIcon(rule.name)}
                      </div>
                      <div>
                        <h4 className="font-medium">{rule.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {rule.percentage.toFixed(1)}% of income
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className={`text-lg font-bold ${rule.isOverBudget ? 'text-red-600' : rule.isNearLimit ? 'text-orange-600' : 'text-green-600'}`}>
                          {rule.percentage.toFixed(0)}%
                        </span>
                        {rule.isOverBudget && (
                          <Badge variant="destructive">Over Budget</Badge>
                        )}
                        {rule.isNearLimit && !rule.isOverBudget && (
                          <Badge variant="secondary">Near Limit</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>
                        {formatCurrency(rule.spent, settings.currency, settings.showCents)} / {formatCurrency(rule.budget, settings.currency, settings.showCents)}
                      </span>
                      <span className="text-muted-foreground">
                        {rule.remaining > 0 ? `${formatCurrency(rule.remaining, settings.currency, settings.showCents)} remaining` : 'Over budget'}
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(rule.percentage, 100)} 
                      className="h-2"
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-medium mb-2">This Month's Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Budgeted</p>
                  <p className="font-medium">
                    {formatCurrency(
                      budgetRuleData.reduce((sum, rule) => sum + rule.budget, 0),
                      settings.currency,
                      settings.showCents
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Spent</p>
                  <p className="font-medium">
                    {formatCurrency(
                      budgetRuleData.reduce((sum, rule) => sum + rule.spent, 0),
                      settings.currency,
                      settings.showCents
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
