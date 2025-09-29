import { create } from "zustand"
import { type Transaction, type Category, type Budget, type BudgetRule, db } from "./database"
import { useUserStore } from "./user-store"

interface TransactionStore {
  transactions: Transaction[]
  categories: Category[]
  budgets: Budget[]
  budgetRules: BudgetRule[]
  isLoading: boolean

  // Transaction Actions
  loadTransactions: () => Promise<void>
  loadCategories: () => Promise<void>
  addTransaction: (transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">) => Promise<void>
  updateTransaction: (id: number, transaction: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: number) => Promise<void>
  getTransactionsByDateRange: (startDate: Date, endDate: Date) => Transaction[]
  getTransactionsByCategory: (category: string) => Transaction[]

  // Category Actions
  addCategory: (category: Omit<Category, "id" | "createdAt" | "updatedAt">) => Promise<void>
  updateCategory: (id: number, category: Partial<Category>) => Promise<void>
  deleteCategory: (id: number) => Promise<void>

  // Budget Actions
  loadBudgets: () => Promise<void>
  addBudget: (budget: Omit<Budget, "id" | "createdAt" | "updatedAt">) => Promise<void>
  updateBudget: (id: number, budget: Partial<Budget>) => Promise<void>
  deleteBudget: (id: number) => Promise<void>
  getBudgetByCategory: (category: string) => Budget | undefined
  getBudgetProgress: (budgetId: number) => { spent: number; remaining: number; percentage: number }

  // Budget Rule Actions
  loadBudgetRules: () => Promise<void>
  updateBudgetRule: (id: number, rule: Partial<BudgetRule>) => Promise<void>
  getBudgetRuleProgress: (ruleId: number, monthlyIncome: number) => { spent: number; budget: number; remaining: number; percentage: number }
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  categories: [],
  budgets: [],
  budgetRules: [],
  isLoading: false,

  loadTransactions: async () => {
    set({ isLoading: true })
    try {
      const { currentUser } = useUserStore.getState()
      if (!currentUser) {
        set({ transactions: [], isLoading: false })
        return
      }
      
      // Load all transactions and filter by user
      const allTransactions = await db.transactions.orderBy("date").reverse().toArray()
      const userTransactions = allTransactions.filter(transaction => 
        transaction.userId === currentUser.id || transaction.userId === undefined
      )
      set({ transactions: userTransactions, isLoading: false })
    } catch (error) {
      console.error("Failed to load transactions:", error)
      set({ isLoading: false })
    }
  },

  loadCategories: async () => {
    try {
      const { currentUser } = useUserStore.getState()
      if (!currentUser) {
        set({ categories: [] })
        return
      }
      
      // Load user-specific categories and default categories (userId: null)
      const userCategories = await db.categories
        .where("userId")
        .equals(currentUser.id)
        .toArray()
      
      // Load all categories and filter for null userId (default categories)
      const allCategoriesFromDb = await db.categories.toArray()
      const defaultCategories = allCategoriesFromDb.filter(cat => cat.userId === null)
      
      const allCategories = [...userCategories, ...defaultCategories]
      set({ categories: allCategories })
    } catch (error) {
      console.error("Failed to load categories:", error)
    }
  },

  addCategory: async (categoryData) => {
    try {
      const { currentUser } = useUserStore.getState()
      if (!currentUser) return
      
      const now = new Date()
      const category: Omit<Category, "id"> = {
        ...categoryData,
        userId: currentUser.id,
        createdAt: now,
        updatedAt: now,
      }

      const id = await db.categories.add(category)
      // Update local state immediately with the new category
      const newCategory = { ...category, id } as Category
      set((state) => ({
        categories: [...state.categories, newCategory]
      }))
    } catch (error) {
      console.error("Failed to add category:", error)
    }
  },

  updateCategory: async (id, updates) => {
    try {
      await db.categories.update(id, {
        ...updates,
        updatedAt: new Date(),
      })
      // Update local state immediately
      set((state) => ({
        categories: state.categories.map(cat => 
          cat.id === id 
            ? { ...cat, ...updates, updatedAt: new Date() }
            : cat
        )
      }))
    } catch (error) {
      console.error("Failed to update category:", error)
    }
  },

  deleteCategory: async (id) => {
    try {
      await db.categories.delete(id)
      // Update local state immediately
      set((state) => ({
        categories: state.categories.filter(cat => cat.id !== id)
      }))
    } catch (error) {
      console.error("Failed to delete category:", error)
    }
  },

  addTransaction: async (transactionData) => {
    try {
      const { currentUser } = useUserStore.getState()
      if (!currentUser) return
      
      const now = new Date()
      const transaction: Omit<Transaction, "id"> = {
        ...transactionData,
        userId: currentUser.id,
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
      const { currentUser } = useUserStore.getState()
      if (!currentUser) {
        set({ budgets: [] })
        return
      }
      
      // Load all budgets and filter by user
      const allBudgets = await db.budgets.orderBy("createdAt").reverse().toArray()
      const userBudgets = allBudgets.filter(budget => 
        budget.userId === currentUser.id || budget.userId === undefined
      )
      set({ budgets: userBudgets })
    } catch (error) {
      console.error("Failed to load budgets:", error)
    }
  },

  addBudget: async (budgetData) => {
    try {
      const { currentUser } = useUserStore.getState()
      if (!currentUser) return
      
      const now = new Date()
      const budget: Omit<Budget, "id"> = {
        ...budgetData,
        userId: currentUser.id,
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
        // Get the start of the current week (Sunday)
        const dayOfWeek = now.getDay()
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek)
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

  loadBudgetRules: async () => {
    try {
      const { currentUser } = useUserStore.getState()
      if (!currentUser) {
        set({ budgetRules: [] })
        return
      }
      
      // Load user-specific budget rules and default rules (userId: null)
      const userBudgetRules = await db.budgetRules
        .where("userId")
        .equals(currentUser.id)
        .toArray()
      
      // Load all budget rules and filter for null userId (default rules)
      const allBudgetRulesFromDb = await db.budgetRules.toArray()
      const defaultBudgetRules = allBudgetRulesFromDb.filter(rule => rule.userId === null)
      
      const allBudgetRules = [...userBudgetRules, ...defaultBudgetRules]
      set({ budgetRules: allBudgetRules })
    } catch (error) {
      console.error("Failed to load budget rules:", error)
    }
  },

  updateBudgetRule: async (id, updates) => {
    try {
      const { currentUser } = useUserStore.getState()
      if (!currentUser) return
      
      await db.budgetRules.update(id, {
        ...updates,
        userId: currentUser.id,
        updatedAt: new Date(),
      })
      get().loadBudgetRules() // Reload budget rules
    } catch (error) {
      console.error("Failed to update budget rule:", error)
    }
  },

  getBudgetRuleProgress: (ruleId, monthlyIncome) => {
    const rule = get().budgetRules.find((r) => r.id === ruleId)
    if (!rule) return { spent: 0, budget: 0, remaining: 0, percentage: 0 }

    const currentMonth = new Date()
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

    const spent = get()
      .transactions.filter(
        (t) => t.budgetRuleId === ruleId && t.amount < 0 && t.date >= startOfMonth && t.date <= endOfMonth,
      )
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const budget = (monthlyIncome * rule.percentage) / 100
    const remaining = Math.max(0, budget - spent)
    const percentage = budget > 0 ? (spent / budget) * 100 : 0

    return { spent, budget, remaining, percentage }
  },
}))
