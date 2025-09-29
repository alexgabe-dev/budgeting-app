"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Plus,
  Edit,
  Trash2,
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
  const { transactions, budgets, loadTransactions, loadBudgets, addBudget, updateBudget, deleteBudget } = useTransactionStore()
  const { settings } = useSettingsStore()
  
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [newBudget, setNewBudget] = useState({
    category: "",
    amount: 0,
    period: "monthly" as const
  })

  // 50/30/20 Rule presets
  const budgetRules: BudgetRule[] = [
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
    loadBudgets()
  }, [loadTransactions, loadBudgets])

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

  // Calculate budget performance
  const budgetPerformance = budgets.map(budget => {
    const categorySpending = transactions
      .filter(t => 
        t.category === budget.category && 
        t.amount < 0 && 
        new Date(t.date) >= startOfMonth && 
        new Date(t.date) <= endOfMonth
      )
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const percentage = budget.amount > 0 ? (categorySpending / budget.amount) * 100 : 0
    const isOverBudget = percentage > 100
    const isNearLimit = percentage > 80

    return {
      ...budget,
      spent: categorySpending,
      remaining: budget.amount - categorySpending,
      percentage: Math.min(percentage, 100),
      isOverBudget,
      isNearLimit
    }
  })

  const handleCreateBudget = async () => {
    if (!newBudget.category || newBudget.amount <= 0) return

    setIsLoading(true)
    try {
      await addBudget({
        category: newBudget.category,
        amount: newBudget.amount,
        period: newBudget.period,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      setNewBudget({ category: "", amount: 0, period: "monthly" })
      setShowCreateDialog(false)
    } catch (error) {
      console.error("Failed to create budget:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteBudget = async (budgetId: number) => {
    if (!window.confirm("Are you sure you want to delete this budget?")) return

    setIsLoading(true)
    try {
      await deleteBudget(budgetId)
    } catch (error) {
      console.error("Failed to delete budget:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyBudgetRule = (rule: BudgetRule) => {
    const amount = (monthlyIncome * rule.percentage) / 100
    setNewBudget(prev => ({
      ...prev,
      amount: Math.round(amount)
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Budget Management</h2>
          <p className="text-muted-foreground">Plan, track, and control your spending</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Create Budget
        </Button>
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
                      <rule.icon className="h-5 w-5" style={{ color: rule.color }} />
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBudget(budget.id!)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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

      {/* Create Budget Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background border rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold mb-4">Create New Budget</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={newBudget.category}
                  onChange={(e) => setNewBudget(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Food & Dining"
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newBudget.amount}
                  onChange={(e) => setNewBudget(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="period">Period</Label>
                <select
                  id="period"
                  value={newBudget.period}
                  onChange={(e) => setNewBudget(prev => ({ ...prev, period: e.target.value as any }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateBudget} disabled={isLoading}>
                Create Budget
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
