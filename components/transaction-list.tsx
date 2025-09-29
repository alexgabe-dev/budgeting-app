"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  MoreHorizontal,
  Search,
  Edit,
  Trash2,
  UtensilsCrossed,
  Car,
  Gamepad2,
  ShoppingBag,
  Receipt,
  Heart,
  Banknote,
  Briefcase,
  TrendingUp,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTransactionStore } from "@/lib/store"
import { useSettingsStore, formatCurrency } from "@/lib/settings-store"

const iconMap = {
  UtensilsCrossed,
  Car,
  Gamepad2,
  ShoppingBag,
  Receipt,
  Heart,
  Banknote,
  Briefcase,
  TrendingUp,
}

export function TransactionList() {
  const { transactions, categories, isLoading, loadTransactions, loadCategories, deleteTransaction, updateTransaction } =
    useTransactionStore()
  const { settings } = useSettingsStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  
  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<any>(null)
  const [editForm, setEditForm] = useState({
    description: "",
    amount: "",
    category: "",
    type: "expense" as "income" | "expense",
    date: ""
  })

  useEffect(() => {
    loadTransactions()
    loadCategories()
  }, [loadTransactions, loadCategories])

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || transaction.category === categoryFilter
    const matchesType = typeFilter === "all" || transaction.type === typeFilter

    return matchesSearch && matchesCategory && matchesType
  })

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      await deleteTransaction(id)
    }
  }

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction)
    setEditForm({
      description: transaction.description,
      amount: Math.abs(transaction.amount).toString(),
      category: transaction.category,
      type: transaction.type,
      date: new Date(transaction.date).toISOString().split('T')[0]
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingTransaction?.id) return

    const amount = parseFloat(editForm.amount)
    if (isNaN(amount)) return

    const finalAmount = editForm.type === "expense" ? -amount : amount

    await updateTransaction(editingTransaction.id, {
      description: editForm.description,
      amount: finalAmount,
      category: editForm.category,
      type: editForm.type,
      date: new Date(editForm.date)
    })

    setIsEditDialogOpen(false)
    setEditingTransaction(null)
  }

  const handleCancelEdit = () => {
    setIsEditDialogOpen(false)
    setEditingTransaction(null)
    setEditForm({
      description: "",
      amount: "",
      category: "",
      type: "expense",
      date: ""
    })
  }

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find((c) => c.name === categoryName)
    if (!category) return UtensilsCrossed

    const IconComponent = iconMap[category.icon as keyof typeof iconMap]
    return IconComponent || UtensilsCrossed
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading transactions...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">All Transactions</CardTitle>
        <CardDescription className="text-muted-foreground">
          Manage and track all your financial transactions
        </CardDescription>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm || categoryFilter !== "all" || typeFilter !== "all"
              ? "No transactions match your filters."
              : "No transactions yet. Add your first transaction to get started!"}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => {
              const Icon = getCategoryIcon(transaction.category)
              const category = categories.find((c) => c.name === transaction.category)

              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: category?.color + "20" }}
                    >
                      <Icon className="w-6 h-6" style={{ color: category?.color }} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-foreground">{transaction.description}</h3>
                        <Badge variant={transaction.type === "income" ? "default" : "secondary"} className="text-xs">
                          {transaction.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`font-semibold text-lg ${
                        transaction.amount < 0 ? "text-destructive" : "text-chart-1"
                      }`}
                    >
                      {transaction.amount < 0 ? "-" : "+"}{formatCurrency(Math.abs(transaction.amount), settings.currency, settings.showCents)}
                    </span>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(transaction)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => transaction.id && handleDelete(transaction.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>

    {/* Edit Transaction Dialog */}
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription>
            Make changes to your transaction here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-description" className="text-right">
              Description
            </Label>
            <Input
              id="edit-description"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-amount" className="text-right">
              Amount
            </Label>
            <Input
              id="edit-amount"
              type="number"
              step="0.01"
              value={editForm.amount}
              onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-category" className="text-right">
              Category
            </Label>
            <Select
              value={editForm.category}
              onValueChange={(value) => setEditForm({ ...editForm, category: value })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-type" className="text-right">
              Type
            </Label>
            <Select
              value={editForm.type}
              onValueChange={(value: "income" | "expense") => setEditForm({ ...editForm, type: value })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-date" className="text-right">
              Date
            </Label>
            <Input
              id="edit-date"
              type="date"
              value={editForm.date}
              onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancelEdit}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSaveEdit}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}
