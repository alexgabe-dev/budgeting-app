"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  Wallet,
  CreditCard,
  PiggyBank,
  BarChart3,
  Home,
  ShoppingBag
} from "lucide-react"
import { motion } from "framer-motion"
import { useTransactionStore } from "@/lib/store"
import { useSettingsStore, formatCurrency } from "@/lib/settings-store"
import DatabaseManager from "@/lib/database-manager"
import { DebtTracking } from "./debt-tracking"

interface Budget {
  id?: number
  category: string
  amount: number
  period: "monthly" | "weekly" | "yearly"
  startDate?: Date
  endDate?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface BudgetRule {
  name: string
  percentage: number
  color: string
  icon: any
  description: string
}

export function BudgetManagement() {
  const { transactions, budgetRules, loadTransactions, loadBudgetRules, getBudgetRuleProgress } = useTransactionStore()
  const { settings } = useSettingsStore()
  
  const [isLoading, setIsLoading] = useState(false)

  // Icon mapping function
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, any> = {
      'Home': Home,
      'ShoppingBag': ShoppingBag,
      'PiggyBank': PiggyBank,
      'Target': Target,
      'DollarSign': DollarSign,
      'CreditCard': CreditCard,
      'Wallet': Wallet
    }
    return iconMap[iconName] || Target // Default to Target if icon not found
  }

  // 50/30/20 Rule presets (these are just for display, actual rules come from the store)
  const defaultBudgetRules: BudgetRule[] = [
    {
      name: "Needs (50%)",
      percentage: 50,
      color: "#FF6B6B",
      icon: Home,
      description: "Essential expenses like rent, utilities, groceries"
    },
    {
      name: "Wants (30%)",
      percentage: 30,
      color: "#4ECDC4",
      icon: ShoppingBag,
      description: "Non-essential but enjoyable expenses"
    },
    {
      name: "Savings (20%)",
      percentage: 20,
      color: "#45B7D1",
      icon: PiggyBank,
      description: "Emergency fund, investments, debt payments"
    }
  ]

  useEffect(() => {
    loadTransactions()
    loadBudgetRules()
  }, [loadTransactions, loadBudgetRules])

  const currentMonth = new Date()
  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

  // Calculate total income for the month
  const monthlyIncome = transactions
    .filter(t => t.amount > 0 && new Date(t.date) >= startOfMonth && new Date(t.date) <= endOfMonth)
    .reduce((sum, t) => sum + t.amount, 0)

  // Calculate total expenses for the month
  const monthlyExpenses = transactions
    .filter(t => t.amount < 0 && new Date(t.date) >= startOfMonth && new Date(t.date) <= endOfMonth)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)


  // Calculate budget rule performance
  const budgetPerformance = budgetRules.map(rule => {
    const progress = getBudgetRuleProgress(rule.id!, monthlyIncome)
    const isOverBudget = progress.percentage > 100
    const isNearLimit = progress.percentage >= 80 && progress.percentage < 100

    return {
      id: rule.id,
      category: rule.name,
      amount: progress.budget,
      period: "monthly" as const,
      isActive: true,
      createdAt: rule.createdAt || new Date(),
      updatedAt: rule.updatedAt || new Date(),
      spent: progress.spent,
      remaining: progress.remaining,
      percentage: progress.percentage,
      isOverBudget,
      isNearLimit,
      color: rule.color,
      icon: rule.icon
    }
  }).filter(rule => rule.amount > 0).sort((a, b) => b.percentage - a.percentage)



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Budget Management</h2>
          <p className="text-muted-foreground">Plan, track, and control your spending</p>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Monthly Income</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {formatCurrency(monthlyIncome, settings.currency, settings.showCents)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">Monthly Expenses</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {formatCurrency(monthlyExpenses, settings.currency, settings.showCents)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className={`border-2 ${monthlyIncome - monthlyExpenses >= 0 ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'}`}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${monthlyIncome - monthlyExpenses >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                  <Wallet className={`h-6 w-6 ${monthlyIncome - monthlyExpenses >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
                </div>
                <div>
                  <p className={`text-sm font-medium ${monthlyIncome - monthlyExpenses >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    Net Balance
                  </p>
                  <p className={`text-2xl font-bold ${monthlyIncome - monthlyExpenses >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                    {formatCurrency(monthlyIncome - monthlyExpenses, settings.currency, settings.showCents)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 50/30/20 Rule Quick Setup */}
      {monthlyIncome > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>50/30/20 Rule Quick Setup</span>
            </CardTitle>
            <CardDescription>
              Based on your monthly income of {formatCurrency(monthlyIncome, settings.currency, settings.showCents)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {budgetRules.map((rule, index) => (
                <motion.div
                  key={rule.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  style={{ borderColor: rule.color }}
                  onClick={() => applyBudgetRule(rule)}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${rule.color}20` }}
                    >
                      {(() => {
                        const IconComponent = getIconComponent(rule.icon)
                        return <IconComponent className="h-5 w-5" style={{ color: rule.color }} />
                      })()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{rule.name}</h3>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold" style={{ color: rule.color }}>
                      {formatCurrency((monthlyIncome * rule.percentage) / 100, settings.currency, settings.showCents)}
                    </p>
                    <p className="text-sm text-muted-foreground">{rule.percentage}% of income</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Budgets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Current Budgets</span>
          </CardTitle>
          <CardDescription>Track your spending against your budget limits</CardDescription>
        </CardHeader>
        <CardContent>
          {budgetPerformance.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No budgets created yet</p>
              <p className="text-sm text-muted-foreground">Create your first budget to start tracking</p>
            </div>
          ) : (
            <div className="space-y-4">
              {budgetPerformance.map((budget, index) => (
                <motion.div
                  key={budget.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{budget.category}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(budget.spent, settings.currency, settings.showCents)} of {formatCurrency(budget.amount, settings.currency, settings.showCents)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {budget.isOverBudget ? (
                        <Badge variant="destructive" className="flex items-center space-x-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Over Budget</span>
                        </Badge>
                      ) : budget.isNearLimit ? (
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Near Limit</span>
                        </Badge>
                      ) : (
                        <Badge variant="default" className="flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>On Track</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{budget.percentage.toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={budget.percentage} 
                      className="h-2"
                      style={{
                        backgroundColor: budget.isOverBudget ? '#ef4444' : budget.isNearLimit ? '#f59e0b' : '#10b981'
                      }}
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {budget.remaining >= 0 ? 'Remaining' : 'Over budget by'}
                      </span>
                      <span className={`font-medium ${budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(Math.abs(budget.remaining), settings.currency, settings.showCents)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debt Tracking Section */}
      <DebtTracking />

    </div>
  )
}
