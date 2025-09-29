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

  constructor() {
    super("Lumo")

    this.version(4).stores({
      transactions: "++id, description, amount, category, date, type, createdAt, updatedAt",
      budgets: "++id, category, amount, period, isActive, createdAt, updatedAt",
      categories: "++id, name, type, isDefault, createdAt, updatedAt, [name+type]",
      appSettings: "++id, key, type, updatedAt",
      dataBackups: "++id, name, version, createdAt",
      users: "++id, email, isActive, createdAt, updatedAt"
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
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { 
          name: "Transportation", 
          color: "#45B7D1", 
          icon: "Car", 
          type: "expense", 
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Entertainment",
          color: "#4ECDC4",
          icon: "Gamepad2",
          type: "expense",
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { 
          name: "Shopping", 
          color: "#96CEB4", 
          icon: "ShoppingBag", 
          type: "expense", 
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Bills & Utilities",
          color: "#85C1E9",
          icon: "Receipt",
          type: "expense",
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { 
          name: "Healthcare", 
          color: "#FFEAA7", 
          icon: "Heart", 
          type: "expense", 
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { 
          name: "Salary", 
          color: "#82E0AA", 
          icon: "Banknote", 
          type: "income", 
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { 
          name: "Freelance", 
          color: "#DDA0DD", 
          icon: "Briefcase", 
          type: "income", 
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { 
          name: "Investment", 
          color: "#F7DC6F", 
          icon: "TrendingUp", 
          type: "income", 
          isDefault: true,
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
      
      try {
        await this.dataBackups.clear()
        console.log("✓ Backups cleared")
      } catch (error) {
        console.warn("Failed to clear backups:", error)
      }
      
      // Re-initialize default data after clearing
      console.log("Re-initializing default data...")
      await this.initializeDefaultCategories()
      await this.initializeDefaultSettings()
      console.log("✓ Default data re-initialized")
      
      console.log("✓ All data cleared and re-initialized successfully")
    } catch (error) {
      console.error("Failed to clear all data:", error)
      throw new Error(`Failed to clear database: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getDatabaseStats() {
    const [transactions, budgets, categories, appSettings, backups, userCategories] = await Promise.all([
      this.transactions.count(),
      this.budgets.count(),
      this.categories.count(),
      this.appSettings.count(),
      this.dataBackups.count(),
      this.categories.filter(cat => !cat.isDefault).count()
    ])

    return {
      transactions,
      budgets,
      categories: userCategories, // Only show user-created categories
      appSettings: appSettings, // Keep settings count as it's useful
      backups,
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
