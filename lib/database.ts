import Dexie, { type Table } from "dexie"

export interface Transaction {
  id?: number
  description: string
  amount: number
  category: string
  date: Date
  type: "income" | "expense"
  tags?: string[]
  notes?: string
  userId?: number
  budgetRuleId?: number
  createdAt: Date
  updatedAt: Date
}

export interface Budget {
  id?: number
  category: string
  amount: number
  period: "monthly" | "weekly" | "yearly"
  startDate?: Date
  endDate?: Date
  isActive: boolean
  userId?: number
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id?: number
  name: string
  color: string
  icon: string
  type: "income" | "expense"
  isDefault: boolean
  userId?: number
  createdAt: Date
  updatedAt: Date
}

export interface AppSettings {
  id?: number
  key: string
  value: any
  type: "string" | "number" | "boolean" | "object"
  updatedAt: Date
}

export interface DataBackup {
  id?: number
  name: string
  description?: string
  data: any
  version: string
  createdAt: Date
}

export interface BudgetRule {
  id?: number
  name: string
  percentage: number
  color: string
  icon: string
  userId?: number
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id?: number
  email: string
  password: string
  name: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export class BudgetDatabase extends Dexie {
  transactions!: Table<Transaction>
  budgets!: Table<Budget>
  categories!: Table<Category>
  appSettings!: Table<AppSettings>
  dataBackups!: Table<DataBackup>
  users!: Table<User>
  budgetRules!: Table<BudgetRule>
  
  private _isResetting: boolean = false

  constructor() {
    super("Lumo")

    this.version(6).stores({
      transactions: "++id, description, amount, category, date, type, userId, budgetRuleId, createdAt, updatedAt",
      budgets: "++id, category, amount, period, isActive, userId, createdAt, updatedAt",
      categories: "++id, name, type, isDefault, userId, createdAt, updatedAt, [name+type]",
      appSettings: "++id, key, type, updatedAt",
      dataBackups: "++id, name, version, createdAt",
      users: "++id, email, isActive, createdAt, updatedAt",
      budgetRules: "++id, name, percentage, color, icon, userId, createdAt, updatedAt"
    })

    this.on("ready", () => {
      return this.initializeDatabase()
    })
  }

  private async initializeDatabase() {
    await this.cleanupDuplicateCategories()
    await this.initializeDefaultCategories()
    await this.initializeDefaultSettings()
    await this.initializeDefaultUsers()
    await this.initializeDefaultBudgetRules()
    await this.migrateExistingData()
    await this.cleanupExistingDemoData()
    
    // Demo data initialization is now completely disabled
    // This prevents demo data from being added after database resets
    console.log("Demo data initialization disabled to prevent reset issues")
  }

  private async initializeDefaultCategories() {
    const count = await this.categories.count()
    if (count === 0) {
      const defaultCategories: Omit<Category, "id">[] = [
        {
          name: "Food & Dining",
          color: "#FF6B6B",
          icon: "UtensilsCrossed",
          type: "expense",
          isDefault: true,
          userId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { 
          name: "Transportation", 
          color: "#45B7D1", 
          icon: "Car", 
          type: "expense", 
          isDefault: true,
          userId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Entertainment",
          color: "#4ECDC4",
          icon: "Gamepad2",
          type: "expense",
          isDefault: true,
          userId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { 
          name: "Shopping", 
          color: "#96CEB4", 
          icon: "ShoppingBag", 
          type: "expense", 
          isDefault: true,
          userId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Bills & Utilities",
          color: "#85C1E9",
          icon: "Receipt",
          type: "expense",
          isDefault: true,
          userId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { 
          name: "Healthcare", 
          color: "#FFEAA7", 
          icon: "Heart", 
          type: "expense", 
          isDefault: true,
          userId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { 
          name: "Salary", 
          color: "#82E0AA", 
          icon: "Banknote", 
          type: "income", 
          isDefault: true,
          userId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { 
          name: "Freelance", 
          color: "#DDA0DD", 
          icon: "Briefcase", 
          type: "income", 
          isDefault: true,
          userId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { 
          name: "Investment", 
          color: "#F7DC6F", 
          icon: "TrendingUp", 
          type: "income", 
          isDefault: true,
          userId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      await this.categories.bulkAdd(defaultCategories)
    }
  }

  private async initializeDefaultSettings() {
    const count = await this.appSettings.count()
    if (count === 0) {
      const defaultSettings: Omit<AppSettings, "id">[] = [
        { key: "theme", value: "dark", type: "string", updatedAt: new Date() },
        { key: "currency", value: { code: "USD", symbol: "$", name: "US Dollar", position: "before", decimalPlaces: 2 }, type: "object", updatedAt: new Date() },
        { key: "compactMode", value: false, type: "boolean", updatedAt: new Date() },
        { key: "showCents", value: true, type: "boolean", updatedAt: new Date() },
        { key: "autoBackup", value: true, type: "boolean", updatedAt: new Date() },
        { key: "backupFrequency", value: "weekly", type: "string", updatedAt: new Date() },
      ]

      await this.appSettings.bulkAdd(defaultSettings)
    }
  }

  private async initializeDefaultUsers() {
    const count = await this.users.count()
    if (count === 0) {
      const defaultUsers: Omit<User, "id">[] = [
        {
          email: "gabor.sandor@vizitor.hu",
          password: "192212", // haha simán plain text jelszó, de pls ne csináld élesben xdd
          name: "Gabor Sandor",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          email: "demo@lumo.app",
          password: "demo123", // demo account for testing
          name: "Demo User",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // ide manual adhatc még usert ha unatkozol lol
        // {
        //   email: "user2@example.com",
        //   password: "password123", // igen mert ez olyan titkos omg
        //   name: "User Two",
        //   isActive: true,
        //   createdAt: new Date(),
        //   updatedAt: new Date(),
        // },
        // {
        //   email: "user3@example.com", 
        //   password: "password456", // hacker ne találjon meg pls :D 
        //   name: "User Three",
        //   isActive: true,
        //   createdAt: new Date(),
        //   updatedAt: new Date(),
        // },
      ]

      await this.users.bulkAdd(defaultUsers)
    }
  }

  private async initializeDefaultBudgetRules() {
    const count = await this.budgetRules.count()
    if (count === 0) {
      const defaultBudgetRules: Omit<BudgetRule, "id">[] = [
        {
          name: "Needs",
          percentage: 50,
          color: "#FF6B6B",
          icon: "Home",
          userId: null, // Available to all users
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Wants",
          percentage: 30,
          color: "#4ECDC4",
          icon: "ShoppingBag",
          userId: null, // Available to all users
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Savings",
          percentage: 20,
          color: "#96CEB4",
          icon: "PiggyBank",
          userId: null, // Available to all users
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      await this.budgetRules.bulkAdd(defaultBudgetRules)
    }
  }

  private async cleanupExistingDemoData() {
    try {
      // Get demo user
      const demoUser = await this.users.where("email").equals("demo@lumo.app").first()
      if (!demoUser) return

      // Update existing demo transactions to be associated with demo user
      await this.transactions
        .where("description")
        .startsWith("Demo")
        .modify({ userId: demoUser.id })

      // Update existing demo budgets to be associated with demo user
      await this.budgets
        .where("category")
        .anyOf(["Gym Membership", "Investment Returns", "Home Improvement", "Side Business"])
        .modify({ userId: demoUser.id })

      // Update existing demo categories to be associated with demo user
      await this.categories
        .where("name")
        .anyOf(["Gym Membership", "Investment Returns", "Home Improvement", "Side Business"])
        .modify({ userId: demoUser.id })

      console.log("Demo data cleanup completed")
    } catch (error) {
      console.error("Error cleaning up demo data:", error)
    }
  }

  private async migrateExistingData() {
    try {
      // Get the first user (gabor.sandor@vizitor.hu) to associate existing data
      const firstUser = await this.users.where("email").equals("gabor.sandor@vizitor.hu").first()
      if (!firstUser) return

      // Update existing transactions without userId to belong to the first user
      const transactionsWithoutUserId = await this.transactions
        .filter(transaction => transaction.userId === undefined)
        .toArray()
      
      for (const transaction of transactionsWithoutUserId) {
        await this.transactions.update(transaction.id!, { userId: firstUser.id })
      }

      // Update existing budgets without userId to belong to the first user
      const budgetsWithoutUserId = await this.budgets
        .filter(budget => budget.userId === undefined)
        .toArray()
      
      for (const budget of budgetsWithoutUserId) {
        await this.budgets.update(budget.id!, { userId: firstUser.id })
      }

      // Update existing categories without userId to belong to the first user (except default ones)
      const categoriesWithoutUserId = await this.categories
        .filter(category => category.userId === undefined && !category.isDefault)
        .toArray()
      
      for (const category of categoriesWithoutUserId) {
        await this.categories.update(category.id!, { userId: firstUser.id })
      }

      console.log("Data migration completed")
    } catch (error) {
      console.error("Error migrating existing data:", error)
    }
  }

  private async initializeDemoData() {
    // This function is now disabled to prevent demo data from being added
    // after database resets
    console.log("Demo data initialization is disabled")
    return

    // Get the demo user ID
    const demoUser = await this.users.where("email").equals("demo@lumo.app").first()
    if (!demoUser) return // Demo user not found

    // Add custom demo categories first
    const customDemoCategories: Omit<Category, "id">[] = [
      {
        name: "Gym Membership",
        color: "#FF6B6B",
        icon: "Heart",
        type: "expense",
        isDefault: false,
        userId: demoUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Investment Returns",
        color: "#4ECDC4",
        icon: "TrendingUp",
        type: "income",
        isDefault: false,
        userId: demoUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Home Improvement",
        color: "#45B7D1",
        icon: "Home",
        type: "expense",
        isDefault: false,
        userId: demoUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Side Business",
        color: "#96CEB4",
        icon: "Briefcase",
        type: "income",
        isDefault: false,
        userId: demoUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    await this.categories.bulkAdd(customDemoCategories)

    // Comprehensive demo transactions (last 6 months with 50+ transactions)
    const now = new Date()
    const demoTransactions: Omit<Transaction, "id">[] = [
      // Recent transactions (last 2 weeks)
      {
        description: "Demo: Morning Coffee",
        amount: -4.50,
        category: "Food & Dining",
        type: "expense",
        date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Grocery Shopping",
        amount: -127.45,
        category: "Food & Dining",
        type: "expense",
        date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Netflix Subscription",
        amount: -15.99,
        category: "Entertainment",
        type: "expense",
        date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Uber to Airport",
        amount: -28.75,
        category: "Transportation",
        type: "expense",
        date: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Gym Membership",
        amount: -49.99,
        category: "Gym Membership",
        type: "expense",
        date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Salary Payment",
        amount: 4500.00,
        category: "Salary",
        type: "income",
        date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Lunch with Colleagues",
        amount: -23.50,
        category: "Food & Dining",
        type: "expense",
        date: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Gas Station Fill-up",
        amount: -52.30,
        category: "Transportation",
        type: "expense",
        date: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Amazon Purchase",
        amount: -89.99,
        category: "Shopping",
        type: "expense",
        date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Movie Tickets",
        amount: -24.00,
        category: "Entertainment",
        type: "expense",
        date: new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Freelance Project",
        amount: 850.00,
        category: "Freelance",
        type: "income",
        date: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Spotify Premium",
        amount: -9.99,
        category: "Entertainment",
        type: "expense",
        date: new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Electric Bill",
        amount: -89.50,
        category: "Bills & Utilities",
        type: "expense",
        date: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Last month transactions (weeks 3-4)
      {
        description: "Demo: Restaurant Dinner",
        amount: -67.80,
        category: "Food & Dining",
        type: "expense",
        date: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Investment Returns",
        amount: 125.30,
        category: "Investment Returns",
        type: "income",
        date: new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Home Depot",
        amount: -234.67,
        category: "Home Improvement",
        type: "expense",
        date: new Date(now.getTime() - 17 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Side Business Income",
        amount: 320.00,
        category: "Side Business",
        type: "income",
        date: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Coffee Shop",
        amount: -6.75,
        category: "Food & Dining",
        type: "expense",
        date: new Date(now.getTime() - 19 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Uber Ride",
        amount: -18.45,
        category: "Transportation",
        type: "expense",
        date: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Grocery Shopping",
        amount: -98.32,
        category: "Food & Dining",
        type: "expense",
        date: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Gym Membership",
        amount: -49.99,
        category: "Gym Membership",
        type: "expense",
        date: new Date(now.getTime() - 22 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Phone Bill",
        amount: -78.50,
        category: "Bills & Utilities",
        type: "expense",
        date: new Date(now.getTime() - 23 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Weekend Trip",
        amount: -450.00,
        category: "Entertainment",
        type: "expense",
        date: new Date(now.getTime() - 24 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Monthly Salary",
        amount: 4500.00,
        category: "Salary",
        type: "income",
        date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Rent Payment",
        amount: -1200.00,
        category: "Bills & Utilities",
        type: "expense",
        date: new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Car Insurance",
        amount: -156.78,
        category: "Transportation",
        type: "expense",
        date: new Date(now.getTime() - 32 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Investment Returns",
        amount: 89.45,
        category: "Investment Returns",
        type: "income",
        date: new Date(now.getTime() - 33 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Two months ago
      {
        description: "Demo: Monthly Salary",
        amount: 4500.00,
        category: "Salary",
        type: "income",
        date: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Rent Payment",
        amount: -1200.00,
        category: "Bills & Utilities",
        type: "expense",
        date: new Date(now.getTime() - 61 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Grocery Shopping",
        amount: -156.78,
        category: "Food & Dining",
        type: "expense",
        date: new Date(now.getTime() - 62 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Gym Membership",
        amount: -49.99,
        category: "Gym Membership",
        type: "expense",
        date: new Date(now.getTime() - 63 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Freelance Work",
        amount: 650.00,
        category: "Freelance",
        type: "income",
        date: new Date(now.getTime() - 64 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Side Business",
        amount: 280.00,
        category: "Side Business",
        type: "income",
        date: new Date(now.getTime() - 65 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Coffee & Pastry",
        amount: -8.25,
        category: "Food & Dining",
        type: "expense",
        date: new Date(now.getTime() - 66 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Gas Station",
        amount: -45.20,
        category: "Transportation",
        type: "expense",
        date: new Date(now.getTime() - 67 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Netflix Subscription",
        amount: -15.99,
        category: "Entertainment",
        type: "expense",
        date: new Date(now.getTime() - 68 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Electric Bill",
        amount: -89.50,
        category: "Bills & Utilities",
        type: "expense",
        date: new Date(now.getTime() - 69 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Three months ago
      {
        description: "Demo: Monthly Salary",
        amount: 4500.00,
        category: "Salary",
        type: "income",
        date: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Rent Payment",
        amount: -1200.00,
        category: "Bills & Utilities",
        type: "expense",
        date: new Date(now.getTime() - 91 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Grocery Shopping",
        amount: -142.30,
        category: "Food & Dining",
        type: "expense",
        date: new Date(now.getTime() - 92 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Gym Membership",
        amount: -49.99,
        category: "Gym Membership",
        type: "expense",
        date: new Date(now.getTime() - 93 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Freelance Work",
        amount: 750.00,
        category: "Freelance",
        type: "income",
        date: new Date(now.getTime() - 94 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Side Business",
        amount: 350.00,
        category: "Side Business",
        type: "income",
        date: new Date(now.getTime() - 95 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Investment Returns",
        amount: 156.80,
        category: "Investment Returns",
        type: "income",
        date: new Date(now.getTime() - 96 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Home Improvement",
        amount: -189.45,
        category: "Home Improvement",
        type: "expense",
        date: new Date(now.getTime() - 97 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Car Maintenance",
        amount: -320.00,
        category: "Transportation",
        type: "expense",
        date: new Date(now.getTime() - 98 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Concert Tickets",
        amount: -85.00,
        category: "Entertainment",
        type: "expense",
        date: new Date(now.getTime() - 99 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Four months ago
      {
        description: "Demo: Monthly Salary",
        amount: 4500.00,
        category: "Salary",
        type: "income",
        date: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Rent Payment",
        amount: -1200.00,
        category: "Bills & Utilities",
        type: "expense",
        date: new Date(now.getTime() - 121 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Grocery Shopping",
        amount: -134.67,
        category: "Food & Dining",
        type: "expense",
        date: new Date(now.getTime() - 122 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Gym Membership",
        amount: -49.99,
        category: "Gym Membership",
        type: "expense",
        date: new Date(now.getTime() - 123 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Freelance Work",
        amount: 920.00,
        category: "Freelance",
        type: "income",
        date: new Date(now.getTime() - 124 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Side Business",
        amount: 420.00,
        category: "Side Business",
        type: "income",
        date: new Date(now.getTime() - 125 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Investment Returns",
        amount: 203.45,
        category: "Investment Returns",
        type: "income",
        date: new Date(now.getTime() - 126 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Home Improvement",
        amount: -267.89,
        category: "Home Improvement",
        type: "expense",
        date: new Date(now.getTime() - 127 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Car Insurance",
        amount: -156.78,
        category: "Transportation",
        type: "expense",
        date: new Date(now.getTime() - 128 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Weekend Getaway",
        amount: -680.00,
        category: "Entertainment",
        type: "expense",
        date: new Date(now.getTime() - 129 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Five months ago
      {
        description: "Demo: Monthly Salary",
        amount: 4500.00,
        category: "Salary",
        type: "income",
        date: new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Rent Payment",
        amount: -1200.00,
        category: "Bills & Utilities",
        type: "expense",
        date: new Date(now.getTime() - 151 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Grocery Shopping",
        amount: -178.45,
        category: "Food & Dining",
        type: "expense",
        date: new Date(now.getTime() - 152 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Gym Membership",
        amount: -49.99,
        category: "Gym Membership",
        type: "expense",
        date: new Date(now.getTime() - 153 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Freelance Work",
        amount: 1100.00,
        category: "Freelance",
        type: "income",
        date: new Date(now.getTime() - 154 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Side Business",
        amount: 580.00,
        category: "Side Business",
        type: "income",
        date: new Date(now.getTime() - 155 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Investment Returns",
        amount: 312.67,
        category: "Investment Returns",
        type: "income",
        date: new Date(now.getTime() - 156 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Home Improvement",
        amount: -445.23,
        category: "Home Improvement",
        type: "expense",
        date: new Date(now.getTime() - 157 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Car Maintenance",
        amount: -280.00,
        category: "Transportation",
        type: "expense",
        date: new Date(now.getTime() - 158 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Theater Tickets",
        amount: -125.00,
        category: "Entertainment",
        type: "expense",
        date: new Date(now.getTime() - 159 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Six months ago
      {
        description: "Demo: Monthly Salary",
        amount: 4500.00,
        category: "Salary",
        type: "income",
        date: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Rent Payment",
        amount: -1200.00,
        category: "Bills & Utilities",
        type: "expense",
        date: new Date(now.getTime() - 181 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Grocery Shopping",
        amount: -165.78,
        category: "Food & Dining",
        type: "expense",
        date: new Date(now.getTime() - 182 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Gym Membership",
        amount: -49.99,
        category: "Gym Membership",
        type: "expense",
        date: new Date(now.getTime() - 183 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Freelance Work",
        amount: 800.00,
        category: "Freelance",
        type: "income",
        date: new Date(now.getTime() - 184 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Side Business",
        amount: 450.00,
        category: "Side Business",
        type: "income",
        date: new Date(now.getTime() - 185 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Investment Returns",
        amount: 189.34,
        category: "Investment Returns",
        type: "income",
        date: new Date(now.getTime() - 186 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Home Improvement",
        amount: -334.56,
        category: "Home Improvement",
        type: "expense",
        date: new Date(now.getTime() - 187 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Car Insurance",
        amount: -156.78,
        category: "Transportation",
        type: "expense",
        date: new Date(now.getTime() - 188 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "Demo: Sports Event",
        amount: -95.00,
        category: "Entertainment",
        type: "expense",
        date: new Date(now.getTime() - 189 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    // Add userId to all demo transactions
    const demoTransactionsWithUserId = demoTransactions.map(transaction => ({
      ...transaction,
      userId: demoUser.id
    }))

    await this.transactions.bulkAdd(demoTransactionsWithUserId)

    // Comprehensive demo budgets
    const currentMonth = new Date()
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

    const demoBudgets: Omit<Budget, "id">[] = [
      // 50/30/20 Rule Budgets
      {
        category: "Food & Dining",
        amount: 600.00,
        period: "monthly",
        startDate: nextMonth,
        endDate: monthEnd,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        category: "Bills & Utilities",
        amount: 1200.00,
        period: "monthly",
        startDate: nextMonth,
        endDate: monthEnd,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        category: "Transportation",
        amount: 300.00,
        period: "monthly",
        startDate: nextMonth,
        endDate: monthEnd,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        category: "Entertainment",
        amount: 200.00,
        period: "monthly",
        startDate: nextMonth,
        endDate: monthEnd,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        category: "Gym Membership",
        amount: 50.00,
        period: "monthly",
        startDate: nextMonth,
        endDate: monthEnd,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        category: "Home Improvement",
        amount: 150.00,
        period: "monthly",
        startDate: nextMonth,
        endDate: monthEnd,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Savings and Investment Budgets
      {
        category: "Emergency Fund",
        amount: 500.00,
        period: "monthly",
        startDate: nextMonth,
        endDate: monthEnd,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        category: "Investment",
        amount: 300.00,
        period: "monthly",
        startDate: nextMonth,
        endDate: monthEnd,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Weekly Budgets
      {
        category: "Coffee & Snacks",
        amount: 25.00,
        period: "weekly",
        startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        category: "Entertainment",
        amount: 50.00,
        period: "weekly",
        startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    // Add userId to all demo budgets
    const demoBudgetsWithUserId = demoBudgets.map(budget => ({
      ...budget,
      userId: demoUser.id
    }))

    await this.budgets.bulkAdd(demoBudgetsWithUserId)

    // Add demo debt data for debt tracking
    const demoDebts = [
      {
        name: "Demo: Credit Card Debt",
        totalAmount: 2500.00,
        paidAmount: 750.00,
        minimumPayment: 75.00,
        dueDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        interestRate: 0.1899, // 18.99% APR
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Demo: Student Loan",
        totalAmount: 15000.00,
        paidAmount: 3200.00,
        minimumPayment: 180.00,
        dueDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
        interestRate: 0.045, // 4.5% APR
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Demo: Car Loan",
        totalAmount: 12000.00,
        paidAmount: 4800.00,
        minimumPayment: 220.00,
        dueDate: new Date(now.getTime() + 22 * 24 * 60 * 60 * 1000), // 22 days from now
        interestRate: 0.032, // 3.2% APR
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Demo: Personal Loan",
        totalAmount: 5000.00,
        paidAmount: 1200.00,
        minimumPayment: 150.00,
        dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        interestRate: 0.125, // 12.5% APR
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    // Note: We'll need to add a debts table to the database schema for this
    // For now, we'll store debt data as special transactions
    const debtTransactions: Omit<Transaction, "id">[] = demoDebts.map(debt => ({
      description: `Demo: ${debt.name} - Outstanding: $${(debt.totalAmount - debt.paidAmount).toFixed(2)}`,
      amount: -(debt.totalAmount - debt.paidAmount),
      category: "Debt",
      type: "expense",
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }))

    await this.transactions.bulkAdd(debtTransactions)
  }

 
  // useradder 3000™️ (ők ugranak be a buliba)
  async addUser(email: string, password: string, name: string) {
    try {
      const newUser: Omit<User, "id"> = {
        email,
        password, // igen, jó lenne hash-elni, de most pihen a biztonságos kód
        name,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      const id = await this.users.add(newUser)
      console.log(`User megjott az ID-vel: ${id} 🎉`)
      return { success: true, id }
    } catch (error) {
      console.error("User spawnolás FAIL 💀:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknow usr" }
    }
  }

  async getAllUsers() {
    try {
      return await this.users.toArray()
    } catch (error) {
      console.error("Failed to get users:", error)
      return []
    }
  }

  // Database Management Methods
  async exportAllData() {
    const data = {
      version: "1.0.0",
      exportDate: new Date().toISOString(),
      transactions: await this.transactions.toArray(),
      budgets: await this.budgets.toArray(),
      categories: await this.categories.toArray(),
      appSettings: await this.appSettings.toArray(),
    }
    return data
  }

  async importData(data: any) {
    try {
      // Clear existing data
      await this.transactions.clear()
      await this.budgets.clear()
      await this.categories.clear()
      await this.appSettings.clear()

      // Import new data
      if (data.transactions) {
        await this.transactions.bulkAdd(data.transactions)
      }
      if (data.budgets) {
        await this.budgets.bulkAdd(data.budgets)
      }
      if (data.categories) {
        await this.categories.bulkAdd(data.categories)
      }
      if (data.appSettings) {
        await this.appSettings.bulkAdd(data.appSettings)
      }
    } catch (error) {
      console.error("Failed to import data:", error)
      throw new Error(`Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async createBackup(name: string, description?: string) {
    const data = await this.exportAllData()
    const backup: Omit<DataBackup, "id"> = {
      name,
      description,
      data,
      version: "1.0.0",
      createdAt: new Date(),
    }
    return await this.dataBackups.add(backup)
  }

  async restoreBackup(backupId: number) {
    const backup = await this.dataBackups.get(backupId)
    if (!backup) throw new Error("Backup not found")
    
    await this.importData(backup.data)
    return backup
  }

  async getBackups() {
    return await this.dataBackups.orderBy("createdAt").reverse().toArray()
  }

  async deleteBackup(backupId: number) {
    return await this.dataBackups.delete(backupId)
  }

  async clearAllData() {
    try {
      // Clear each table individually with error handling
      console.log("Starting to clear all data...")
      
      // Set a flag to prevent demo data initialization
      this._isResetting = true
      
      try {
        await this.transactions.clear()
        console.log("✓ Transactions cleared")
      } catch (error) {
        console.warn("Failed to clear transactions:", error)
      }
      
      try {
        await this.budgets.clear()
        console.log("✓ Budgets cleared")
      } catch (error) {
        console.warn("Failed to clear budgets:", error)
      }
      
      try {
        await this.categories.clear()
        console.log("✓ Categories cleared")
      } catch (error) {
        console.warn("Failed to clear categories:", error)
      }
      
      try {
        await this.appSettings.clear()
        console.log("✓ App settings cleared")
      } catch (error) {
        console.warn("Failed to clear app settings:", error)
      }
      
      // Demo data is now permanently disabled
      
      try {
        await this.dataBackups.clear()
        console.log("✓ Backups cleared")
      } catch (error) {
        console.warn("Failed to clear backups:", error)
      }
      
      try {
        await this.budgetRules.clear()
        console.log("✓ Budget rules cleared")
      } catch (error) {
        console.warn("Failed to clear budget rules:", error)
      }
      
      try {
        await this.users.clear()
        console.log("✓ Users cleared")
      } catch (error) {
        console.warn("Failed to clear users:", error)
      }
      
      // Clear localStorage to remove debt tracking data and other local storage
      try {
        localStorage.clear()
        console.log("✓ LocalStorage cleared (including debt tracking data)")
      } catch (error) {
        console.warn("Failed to clear localStorage:", error)
      }
      
      // Re-initialize default data after clearing (but NOT demo data)
      console.log("Re-initializing default data...")
      await this.initializeDefaultCategories()
      await this.initializeDefaultSettings()
      await this.initializeDefaultUsers()
      await this.initializeDefaultBudgetRules()
      // Note: We deliberately do NOT call initializeDemoData() here
      console.log("✓ Default data re-initialized (demo data excluded)")
      
      // Verify the clear was successful
      const finalStats = await this.getDatabaseStats()
      console.log("Final database stats after clear:", finalStats)
      
      console.log("✓ All data cleared and re-initialized successfully")
      
      // Reset the flag
      this._isResetting = false
    } catch (error) {
      console.error("Failed to clear all data:", error)
      // Reset the flag even on error
      this._isResetting = false
      throw new Error(`Failed to clear database: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getDatabaseStats() {
    const [transactions, budgets, categories, appSettings, backups, users, budgetRules, userCategories] = await Promise.all([
      this.transactions.count(),
      this.budgets.count(),
      this.categories.count(),
      this.appSettings.count(),
      this.dataBackups.count(),
      this.users.count(),
      this.budgetRules.count(),
      this.categories.filter(cat => !cat.isDefault).count()
    ])

    return {
      transactions,
      budgets,
      categories: userCategories, // Only show user-created categories
      appSettings: appSettings, // Keep settings count as it's useful
      backups,
      users,
      budgetRules,
      totalCategories: categories, // Total categories including defaults
      defaultCategories: categories - userCategories // Default categories count
    }
  }

  async cleanupDuplicateCategories() {
    try {
      const allCategories = await this.categories.toArray()
      const seen = new Set<string>()
      const duplicates: number[] = []

      for (const category of allCategories) {
        const key = `${category.name}-${category.type}`
        if (seen.has(key)) {
          if (category.id) {
            duplicates.push(category.id)
          }
        } else {
          seen.add(key)
        }
      }

      if (duplicates.length > 0) {
        await this.categories.bulkDelete(duplicates)
        console.log(`Cleaned up ${duplicates.length} duplicate categories`)
      }

      return duplicates.length
    } catch (error) {
      console.error("Failed to cleanup duplicate categories:", error)
      return 0
    }
  }
}

export const db = new BudgetDatabase()
