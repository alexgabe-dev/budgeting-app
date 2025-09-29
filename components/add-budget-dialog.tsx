"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { useTransactionStore } from "@/lib/store"

export function AddBudgetDialog() {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    period: "monthly" as "monthly" | "weekly" | "yearly",
  })

  const { addBudget, categories, budgets, loadCategories } = useTransactionStore()

  // Load categories when dialog opens
  useEffect(() => {
    if (open) {
      loadCategories()
    }
  }, [open, loadCategories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.category || !formData.amount) {
      return
    }

    // Check if budget already exists for this category
    const existingBudget = budgets.find((b) => b.category === formData.category && b.period === formData.period)
    if (existingBudget) {
      alert("A budget already exists for this category and period. Please edit the existing budget instead.")
      return
    }

    await addBudget({
      category: formData.category,
      amount: Number(formData.amount),
      period: formData.period,
    })

    // Reset form
    setFormData({
      category: "",
      amount: "",
      period: "monthly",
    })

    setOpen(false)
  }

  const expenseCategories = categories.filter((c) => c.type === "expense")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Budget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Budget</DialogTitle>
          <DialogDescription>Set spending limits for your expense categories to stay on track.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Budget Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="period">Period</Label>
            <Select
              value={formData.period}
              onValueChange={(value: "monthly" | "weekly" | "yearly") => setFormData({ ...formData, period: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Budget</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
