"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  CreditCard, 
  TrendingDown, 
  Calendar, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Clock,
  TrendingUp
} from "lucide-react"
import { motion } from "framer-motion"
import { useTransactionStore } from "@/lib/store"
import { useSettingsStore, formatCurrency } from "@/lib/settings-store"

interface Debt {
  id?: number
  name: string
  totalAmount: number
  currentBalance: number
  interestRate: number
  minimumPayment: number
  dueDate: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export function DebtTracking() {
  const { transactions, loadTransactions } = useTransactionStore()
  const { settings } = useSettingsStore()
  
  const [debts, setDebts] = useState<Debt[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newDebt, setNewDebt] = useState({
    name: "",
    totalAmount: 0,
    currentBalance: 0,
    interestRate: 0,
    minimumPayment: 0,
    dueDate: ""
  })

  useEffect(() => {
    loadTransactions()
    // Load debts from localStorage for now (you can integrate with database later)
    const savedDebts = localStorage.getItem('debts')
    if (savedDebts) {
      setDebts(JSON.parse(savedDebts))
    }
  }, [loadTransactions])

  const handleCreateDebt = () => {
    if (!newDebt.name || newDebt.currentBalance <= 0) return

    const debt: Debt = {
      ...newDebt,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const updatedDebts = [...debts, debt]
    setDebts(updatedDebts)
    localStorage.setItem('debts', JSON.stringify(updatedDebts))
    
    setNewDebt({
      name: "",
      totalAmount: 0,
      currentBalance: 0,
      interestRate: 0,
      minimumPayment: 0,
      dueDate: ""
    })
    setShowCreateDialog(false)
  }

  const handleDeleteDebt = (debtId: number) => {
    if (!window.confirm("Are you sure you want to delete this debt?")) return

    const updatedDebts = debts.filter(d => d.id !== debtId)
    setDebts(updatedDebts)
    localStorage.setItem('debts', JSON.stringify(updatedDebts))
  }

  const handlePayment = (debtId: number, paymentAmount: number) => {
    const updatedDebts = debts.map(debt => {
      if (debt.id === debtId) {
        const newBalance = Math.max(0, debt.currentBalance - paymentAmount)
        return {
          ...debt,
          currentBalance: newBalance,
          isActive: newBalance > 0,
          updatedAt: new Date()
        }
      }
      return debt
    })
    setDebts(updatedDebts)
    localStorage.setItem('debts', JSON.stringify(updatedDebts))
  }

  const totalDebt = debts.reduce((sum, debt) => sum + debt.currentBalance, 0)
  const totalPaidOff = debts.reduce((sum, debt) => sum + (debt.totalAmount - debt.currentBalance), 0)
  const totalOriginalDebt = debts.reduce((sum, debt) => sum + debt.totalAmount, 0)
  const debtProgress = totalOriginalDebt > 0 ? (totalPaidOff / totalOriginalDebt) * 100 : 0

  const activeDebts = debts.filter(d => d.isActive)
  const paidOffDebts = debts.filter(d => !d.isActive)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Debt Tracking</h2>
          <p className="text-muted-foreground">Monitor and manage your debt payments</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Debt
        </Button>
      </div>

      {/* Debt Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <CreditCard className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">Total Debt</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {formatCurrency(totalDebt, settings.currency, settings.showCents)}
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
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Paid Off</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {formatCurrency(totalPaidOff, settings.currency, settings.showCents)}
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
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Progress</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {debtProgress.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Active Debts</p>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                    {activeDebts.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Debt Progress */}
      {totalOriginalDebt > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5" />
              <span>Debt Payoff Progress</span>
            </CardTitle>
            <CardDescription>Track your overall debt reduction</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium">{debtProgress.toFixed(1)}%</span>
              </div>
              <Progress value={debtProgress} className="h-3" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Original Debt</p>
                  <p className="font-semibold">{formatCurrency(totalOriginalDebt, settings.currency, settings.showCents)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Remaining</p>
                  <p className="font-semibold text-red-600">{formatCurrency(totalDebt, settings.currency, settings.showCents)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Debts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Active Debts</span>
          </CardTitle>
          <CardDescription>Manage your current debt obligations</CardDescription>
        </CardHeader>
        <CardContent>
          {activeDebts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-muted-foreground">No active debts!</p>
              <p className="text-sm text-muted-foreground">You're debt-free! 🎉</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeDebts.map((debt, index) => {
                const progress = debt.totalAmount > 0 ? ((debt.totalAmount - debt.currentBalance) / debt.totalAmount) * 100 : 0
                const isOverdue = new Date(debt.dueDate) < new Date()
                
                return (
                  <motion.div
                    key={debt.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                          <CreditCard className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{debt.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Due: {new Date(debt.dueDate).toLocaleDateString()}
                            {isOverdue && <span className="text-red-500 ml-2">(Overdue)</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isOverdue && (
                          <Badge variant="destructive" className="flex items-center space-x-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Overdue</span>
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDebt(debt.id!)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Current Balance</p>
                          <p className="font-semibold text-red-600">
                            {formatCurrency(debt.currentBalance, settings.currency, settings.showCents)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Minimum Payment</p>
                          <p className="font-semibold">
                            {formatCurrency(debt.minimumPayment, settings.currency, settings.showCents)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Payoff Progress</span>
                          <span className="font-medium">{progress.toFixed(1)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handlePayment(debt.id!, debt.minimumPayment)}
                          className="flex-1"
                        >
                          Pay Minimum
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const amount = prompt(`Enter payment amount for ${debt.name}:`)
                            if (amount && !isNaN(Number(amount))) {
                              handlePayment(debt.id!, Number(amount))
                            }
                          }}
                          className="flex-1"
                        >
                          Custom Payment
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paid Off Debts */}
      {paidOffDebts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Paid Off Debts</span>
            </CardTitle>
            <CardDescription>Congratulations on paying off these debts!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paidOffDebts.map((debt, index) => (
                <motion.div
                  key={debt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-3 border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <h4 className="font-semibold text-green-700 dark:text-green-300">{debt.name}</h4>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Paid off: {formatCurrency(debt.totalAmount, settings.currency, settings.showCents)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      Paid Off
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Debt Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background border rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold mb-4">Add New Debt</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="debtName">Debt Name</Label>
                <Input
                  id="debtName"
                  value={newDebt.name}
                  onChange={(e) => setNewDebt(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Credit Card, Student Loan"
                />
              </div>
              <div>
                <Label htmlFor="totalAmount">Original Amount</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  value={newDebt.totalAmount}
                  onChange={(e) => setNewDebt(prev => ({ ...prev, totalAmount: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="currentBalance">Current Balance</Label>
                <Input
                  id="currentBalance"
                  type="number"
                  value={newDebt.currentBalance}
                  onChange={(e) => setNewDebt(prev => ({ ...prev, currentBalance: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="interestRate">Interest Rate (%)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.01"
                  value={newDebt.interestRate}
                  onChange={(e) => setNewDebt(prev => ({ ...prev, interestRate: Number(e.target.value) }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="minimumPayment">Minimum Payment</Label>
                <Input
                  id="minimumPayment"
                  type="number"
                  value={newDebt.minimumPayment}
                  onChange={(e) => setNewDebt(prev => ({ ...prev, minimumPayment: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newDebt.dueDate}
                  onChange={(e) => setNewDebt(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateDebt} disabled={isLoading}>
                Add Debt
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
