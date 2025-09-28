import { create } from "zustand"
import { type Transaction, type Category, type Budget, db } from "./database"

interface TransactionStore {
  transactions: Transaction[]
  categories: Category[]
  budgets: Budget[]
  isLoading: boolean

  // Transaction Actions
  loadTransactions: () => Promise<void>
  loadCategories: () => Promise<void>
  addTransaction: (transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">) => Promise<void>
  updateTransaction: (id: number, transaction: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: number) => Promise<void>
  getTransactionsByDateRange: (startDate: Date, endDate: Date) => Transaction[]
  getTransactionsByCategory: (category: string) => Transaction[]

  // Budget Actions
  loadBudgets: () => Promise<void>
  addBudget: (budget: Omit<Budget, "id" | "createdAt" | "updatedAt">) => Promise<void>
  updateBudget: (id: number, budget: Partial<Budget>) => Promise<void>
  deleteBudget: (id: number) => Promise<void>
  getBudgetByCategory: (category: string) => Budget | undefined
  getBudgetProgress: (budgetId: number) => { spent: number; remaining: number; percentage: number }
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  categories: [],
  budgets: [],
  isLoading: false,

  loadTransactions: async () => {
    set({ isLoading: true })
    try {
      const transactions = await db.transactions.orderBy("date").reverse().toArray()
      set({ transactions, isLoading: false })
    } catch (error) {
      console.error("Failed to load transactions:", error)
      set({ isLoading: false })
    }
  },

  loadCategories: async () => {
    try {
      const categories = await db.categories.toArray()
      set({ categories })
    } catch (error) {
      console.error("Failed to load categories:", error)
    }
  },

  addTransaction: async (transactionData) => {
    try {
      const now = new Date()
      const transaction: Omit<Transaction, "id"> = {
        ...transactionData,
        createdAt: now,
        updatedAt: now,
      }

      await db.transactions.add(transaction)
      get().loadTransactions() // Reload transactions
    } catch (error) {
      console.error("Failed to add transaction:", error)
    }
  },

  updateTransaction: async (id, updates) => {
    try {
      await db.transactions.update(id, {
        ...updates,
        updatedAt: new Date(),
      })
      get().loadTransactions() // Reload transactions
    } catch (error) {
      console.error("Failed to update transaction:", error)
    }
  },

  deleteTransaction: async (id) => {
    try {
      await db.transactions.delete(id)
      get().loadTransactions() // Reload transactions
    } catch (error) {
      console.error("Failed to delete transaction:", error)
    }
  },

  getTransactionsByDateRange: (startDate, endDate) => {
    return get().transactions.filter((t) => t.date >= startDate && t.date <= endDate)
  },

  getTransactionsByCategory: (category) => {
    return get().transactions.filter((t) => t.category === category)
  },

  loadBudgets: async () => {
    try {
      const budgets = await db.budgets.orderBy("createdAt").reverse().toArray()
      set({ budgets })
    } catch (error) {
      console.error("Failed to load budgets:", error)
    }
  },

  addBudget: async (budgetData) => {
    try {
      const now = new Date()
      const budget: Omit<Budget, "id"> = {
        ...budgetData,
        createdAt: now,
        updatedAt: now,
      }

      await db.budgets.add(budget)
      get().loadBudgets() // Reload budgets
    } catch (error) {
      console.error("Failed to add budget:", error)
    }
  },

  updateBudget: async (id, updates) => {
    try {
      await db.budgets.update(id, {
        ...updates,
        updatedAt: new Date(),
      })
      get().loadBudgets() // Reload budgets
    } catch (error) {
      console.error("Failed to update budget:", error)
    }
  },

  deleteBudget: async (id) => {
    try {
      await db.budgets.delete(id)
      get().loadBudgets() // Reload budgets
    } catch (error) {
      console.error("Failed to delete budget:", error)
    }
  },

  getBudgetByCategory: (category) => {
    return get().budgets.find((b) => b.category === category)
  },

  getBudgetProgress: (budgetId) => {
    const budget = get().budgets.find((b) => b.id === budgetId)
    if (!budget) return { spent: 0, remaining: 0, percentage: 0 }

    // Calculate spending for the budget period
    const now = new Date()
    let startDate: Date
    let endDate: Date

    switch (budget.period) {
      case "weekly":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
        endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000)
        break
      case "yearly":
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = new Date(now.getFullYear() + 1, 0, 1)
        break
      case "monthly":
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        break
    }

    const spent = get()
      .transactions.filter(
        (t) => t.category === budget.category && t.amount < 0 && t.date >= startDate && t.date <= endDate,
      )
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const remaining = Math.max(0, budget.amount - spent)
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0

    return { spent, remaining, percentage }
  },
}))
