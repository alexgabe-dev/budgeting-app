"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useTransactionStore } from "@/lib/store"
import { useSettingsStore, formatCurrency } from "@/lib/settings-store"
import { motion } from "framer-motion"
import { DollarSign, Home, ShoppingBag, PiggyBank, Edit, Save, X } from "lucide-react"

export function BudgetRulesSettings() {
  const { budgetRules, loadBudgetRules, updateBudgetRule } = useTransactionStore()
  const { settings } = useSettingsStore()
  const [editingRule, setEditingRule] = useState<number | null>(null)
  const [editPercentages, setEditPercentages] = useState<Record<number, number>>({})

  useEffect(() => {
    loadBudgetRules()
  }, [loadBudgetRules])

  const handleEdit = (ruleId: number, currentPercentage: number) => {
    setEditingRule(ruleId)
    setEditPercentages(prev => ({ ...prev, [ruleId]: currentPercentage }))
  }

  const handleSave = async (ruleId: number) => {
    const newPercentage = editPercentages[ruleId]
    if (newPercentage !== undefined && newPercentage >= 0 && newPercentage <= 100) {
      await updateBudgetRule(ruleId, { percentage: newPercentage })
      setEditingRule(null)
      setEditPercentages(prev => {
        const updated = { ...prev }
        delete updated[ruleId]
        return updated
      })
    }
  }

  const handleCancel = (ruleId: number) => {
    setEditingRule(null)
    setEditPercentages(prev => {
      const updated = { ...prev }
      delete updated[ruleId]
      return updated
    })
  }

  const totalPercentage = budgetRules.reduce((sum, rule) => sum + rule.percentage, 0)
  const isBalanced = Math.abs(totalPercentage - 100) < 0.01

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

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Budget Allocation Summary</span>
          </CardTitle>
          <CardDescription>
            Current allocation percentages across all budget rules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Allocation</span>
              <div className="flex items-center space-x-2">
                <span className={`text-lg font-bold ${isBalanced ? 'text-green-600' : 'text-orange-600'}`}>
                  {totalPercentage.toFixed(1)}%
                </span>
                <Badge variant={isBalanced ? "default" : "secondary"}>
                  {isBalanced ? "Balanced" : "Unbalanced"}
                </Badge>
              </div>
            </div>
            <Progress value={Math.min(totalPercentage, 100)} className="h-2" />
            {!isBalanced && (
              <p className="text-sm text-orange-600">
                Your budget rules should total 100%. Currently at {totalPercentage.toFixed(1)}%.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Budget Rules */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Budget Rules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgetRules.map((rule) => (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-border rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-full bg-muted ${getRuleColor(rule.name)}`}>
                    {getRuleIcon(rule.name)}
                  </div>
                  <div>
                    <h4 className="font-medium">{rule.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {rule.percentage}% allocation
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(rule.id!, rule.percentage)}
                  disabled={editingRule === rule.id}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>

              {editingRule === rule.id ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Percentage</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={editPercentages[rule.id!] || rule.percentage}
                        onChange={(e) => setEditPercentages(prev => ({
                          ...prev,
                          [rule.id!]: parseFloat(e.target.value) || 0
                        }))}
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleSave(rule.id!)}
                      disabled={editPercentages[rule.id!] < 0 || editPercentages[rule.id!] > 100}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancel(rule.id!)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Allocation</span>
                    <span className="font-medium">{rule.percentage}%</span>
                  </div>
                  <Progress value={rule.percentage} className="h-2" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Help Text */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h4 className="font-medium">About the 50/30/20 Rule</h4>
            <p className="text-sm text-muted-foreground">
              The 50/30/20 rule is a popular budgeting method that suggests allocating your after-tax income as follows:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• <strong>50% for Needs:</strong> Essential expenses like rent, groceries, utilities</li>
              <li>• <strong>30% for Wants:</strong> Non-essential expenses like entertainment, dining out</li>
              <li>• <strong>20% for Savings:</strong> Emergency fund, retirement, investments</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-2">
              You can customize these percentages based on your financial goals and situation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
