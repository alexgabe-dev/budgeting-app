import Dexie, { type Table } from "dexie"

export interface Transaction {
  id?: number
  description: string
  amount: number
  category: string
  date: Date
  type: "income" | "expense"
  tags?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Budget {
  id?: number
  category: string
  amount: number
  period: "monthly" | "weekly" | "yearly"
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id?: number
  name: string
  color: string
  icon: string
  type: "income" | "expense"
  createdAt: Date
}

export class BudgetDatabase extends Dexie {
  transactions!: Table<Transaction>
  budgets!: Table<Budget>
  categories!: Table<Category>

  constructor() {
    super("Lumo")

    this.version(1).stores({
      transactions: "++id, description, amount, category, date, type, createdAt",
      budgets: "++id, category, amount, period, createdAt",
      categories: "++id, name, type, createdAt",
    })

    this.on("ready", () => {
      return this.initializeDefaultCategories()
    })
  }

  private async initializeDefaultCategories() {
    const count = await this.categories.count()
    if (count === 0) {
      const defaultCategories: Omit<Category, "id">[] = [
        {
          name: "Food & Dining",
          color: "hsl(var(--chart-1))",
          icon: "UtensilsCrossed",
          type: "expense",
          createdAt: new Date(),
        },
        { name: "Transportation", color: "hsl(var(--chart-2))", icon: "Car", type: "expense", createdAt: new Date() },
        {
          name: "Entertainment",
          color: "hsl(var(--chart-3))",
          icon: "Gamepad2",
          type: "expense",
          createdAt: new Date(),
        },
        { name: "Shopping", color: "hsl(var(--chart-4))", icon: "ShoppingBag", type: "expense", createdAt: new Date() },
        {
          name: "Bills & Utilities",
          color: "hsl(var(--chart-5))",
          icon: "Receipt",
          type: "expense",
          createdAt: new Date(),
        },
        { name: "Healthcare", color: "hsl(var(--chart-1))", icon: "Heart", type: "expense", createdAt: new Date() },
        { name: "Salary", color: "hsl(var(--chart-2))", icon: "Banknote", type: "income", createdAt: new Date() },
        { name: "Freelance", color: "hsl(var(--chart-3))", icon: "Briefcase", type: "income", createdAt: new Date() },
        { name: "Investment", color: "hsl(var(--chart-4))", icon: "TrendingUp", type: "income", createdAt: new Date() },
      ]

      await this.categories.bulkAdd(defaultCategories)
    }
  }
}

export const db = new BudgetDatabase()
