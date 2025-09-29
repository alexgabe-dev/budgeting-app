"use client"

import { Button } from "@/components/ui/button"
import { Settings, Download, LogOut } from "lucide-react"
import { AddTransactionDialog } from "./add-transaction-dialog"
import { useUserStore } from "@/lib/user-store"
import Link from "next/link"

export function DashboardHeader() {
  const { logout, currentUser } = useUserStore()

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="border-b border-border bg-card" suppressHydrationWarning>
      <div className="container mx-auto px-4 py-4" suppressHydrationWarning>
        <div className="flex items-center justify-between" suppressHydrationWarning>
          <div className="flex items-center space-x-4" suppressHydrationWarning>
            <Link href="/" className="flex items-center space-x-2" suppressHydrationWarning>
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center" suppressHydrationWarning>
                <span className="text-primary-foreground font-bold text-sm">L</span>
              </div>
              <h1 className="text-xl font-semibold text-foreground">Lumo</h1>
            </Link>

            <nav className="hidden md:flex items-center space-x-4">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link
                href="/transactions"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Transactions
              </Link>
              <Link href="/budgets" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Budgets
              </Link>
              <Link href="/reports" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Reports
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Link href="/settings">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link>
            <AddTransactionDialog />
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
