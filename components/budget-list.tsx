"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  MoreHorizontal,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  UtensilsCrossed,
  Car,
  Gamepad2,
  ShoppingBag,
  Receipt,
  Heart,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTransactionStore } from "@/lib/store"
import { motion } from "framer-motion"

const iconMap = {
  UtensilsCrossed,
  Car,
  Gamepad2,
  ShoppingBag,
  Receipt,
  Heart,
}

export function BudgetList() {
  const { budgets, categories, isLoading, loadBudgets, loadCategories, deleteBudget, getBudgetProgress } =
    useTransactionStore()

  useEffect(() => {
    loadBudgets()
    loadCategories()
  }, [loadBudgets, loadCategories])

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this budget?")) {
      await deleteBudget(id)
    }
  }

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find((c) => c.name === categoryName)
    if (!category) return UtensilsCrossed

    const IconComponent = iconMap[category.icon as keyof typeof iconMap]
    return IconComponent || UtensilsCrossed
  }

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find((c) => c.name === categoryName)
    return category?.color || "hsl(var(--chart-1))"
  }

  const getStatusIcon = (percentage: number) => {
    if (percentage > 100) return AlertTriangle
    if (percentage > 80) return Clock
    return CheckCircle
  }

  const getStatusColor = (percentage: number) => {
    if (percentage > 100) return "text-destructive"
    if (percentage > 80) return "text-chart-4"
    return "text-chart-1"
  }

  const getStatusText = (percentage: number) => {
    if (percentage > 100) return "Over Budget"
    if (percentage > 80) return "Near Limit"
    return "On Track"
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading budgets...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Budget Management</CardTitle>
        <CardDescription className="text-muted-foreground">
          Track your spending limits and stay within budget
        </CardDescription>
      </CardHeader>
      <CardContent>
        {budgets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Receipt className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium mb-2">No budgets created yet</p>
            <p className="text-sm">Create your first budget to start tracking your spending limits.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {budgets.map((budget, index) => {
              const progress = getBudgetProgress(budget.id!)
              const Icon = getCategoryIcon(budget.category)
              const categoryColor = getCategoryColor(budget.category)
              const StatusIcon = getStatusIcon(progress.percentage)

              return (
                <motion.div
                  key={budget.id}
                  className="p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: categoryColor + "20" }}
                      >
                        <Icon className="w-6 h-6" style={{ color: categoryColor }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{budget.category}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {budget.period}
                          </Badge>
                          <div className={`flex items-center space-x-1 ${getStatusColor(progress.percentage)}`}>
                            <StatusIcon className="w-3 h-3" />
                            <span className="text-xs font-medium">{getStatusText(progress.percentage)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => budget.id && handleDelete(budget.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        ${progress.spent.toFixed(2)} of ${budget.amount.toFixed(2)}
                      </span>
                      <span className={`font-medium ${getStatusColor(progress.percentage)}`}>
                        {progress.percentage.toFixed(1)}%
                      </span>
                    </div>

                    <div className="relative">
                      <Progress value={Math.min(progress.percentage, 100)} className="h-3" />
                      {progress.percentage > 100 && (
                        <div className="absolute top-0 left-0 w-full h-3 bg-destructive/20 rounded-full">
                          <div
                            className="h-full bg-destructive rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((progress.percentage - 100) * 2, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Remaining: ${progress.remaining.toFixed(2)}</span>
                      {progress.percentage > 100 && (
                        <span className="text-destructive font-medium">
                          Over by: ${(progress.spent - budget.amount).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
