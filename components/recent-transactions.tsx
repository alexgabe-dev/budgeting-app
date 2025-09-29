"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ShoppingCart,
  Car,
  Coffee,
  Gamepad2,
  UtensilsCrossed,
  Receipt,
  Heart,
  Banknote,
  Briefcase,
  TrendingUp,
  ShoppingBag,
  ArrowRight,
} from "lucide-react"
import { useTransactionStore } from "@/lib/store"
import { useSettingsStore, formatCurrency } from "@/lib/settings-store"
import { motion } from "framer-motion"
import Link from "next/link"

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
  ShoppingCart,
  Coffee,
}

export function RecentTransactions() {
  const { transactions, categories, loadTransactions, loadCategories } = useTransactionStore()

  useEffect(() => {
    loadTransactions()
    loadCategories()
  }, [loadTransactions, loadCategories])

  const recentTransactions = transactions.slice(0, 5)

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find((c) => c.name === categoryName)
    if (!category) return UtensilsCrossed

    const IconComponent = iconMap[category.icon as keyof typeof iconMap]
    return IconComponent || UtensilsCrossed
  }

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find((c) => c.name === categoryName)
    return category?.color || "hsl(var(--chart-1))"
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInHours < 48) return "1 day ago"
    return `${Math.floor(diffInHours / 24)} days ago`
  }

  const { settings } = useSettingsStore()
  const isCompact = settings.compactMode

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="bg-card border-border h-full">
        <CardHeader className={isCompact ? "pb-2" : "pb-4"}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className={`${isCompact ? 'text-lg' : 'text-xl'} text-foreground`}>Recent Transactions</CardTitle>
              <CardDescription className={`${isCompact ? 'text-xs' : 'text-sm'} text-muted-foreground`}>Your latest spending activity</CardDescription>
            </div>
            <Link href="/transactions">
              <Button variant="outline" size={isCompact ? "sm" : "default"}>
                View All
                <ArrowRight className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'} ml-2`} />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {recentTransactions.length === 0 ? (
            <div className={`text-center ${isCompact ? 'py-4' : 'py-8'} text-muted-foreground`}>
              <p className={isCompact ? 'text-sm' : 'text-base'}>No transactions yet.</p>
              <p className={`${isCompact ? 'text-xs' : 'text-sm'} mt-2`}>Add your first transaction to get started!</p>
            </div>
          ) : (
            <div className={isCompact ? 'space-y-2' : 'space-y-3'}>
              {recentTransactions.map((transaction, index) => {
                const Icon = getCategoryIcon(transaction.category)
                const categoryColor = getCategoryColor(transaction.category)

                return (
                  <motion.div
                    key={transaction.id}
                    className={`flex items-center justify-between ${isCompact ? 'p-2' : 'p-3'} rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className={`flex items-center ${isCompact ? 'space-x-2' : 'space-x-3'}`}>
                      <div
                        className={`${isCompact ? 'w-8 h-8' : 'w-10 h-10'} rounded-full flex items-center justify-center`}
                        style={{ backgroundColor: categoryColor + "20" }}
                      >
                        <Icon className={`${isCompact ? 'w-4 h-4' : 'w-5 h-5'}`} style={{ color: categoryColor }} />
                      </div>
                      <div>
                        <p className={`${isCompact ? 'text-sm' : 'text-base'} font-medium text-foreground`}>{transaction.description}</p>
                        <div className="flex items-center space-x-2">
                          <Badge variant={transaction.type === "income" ? "default" : "secondary"} className={isCompact ? 'text-[10px]' : 'text-xs'}>
                            {transaction.category}
                          </Badge>
                          <span className={`${isCompact ? 'text-[10px]' : 'text-xs'} text-muted-foreground`}>{formatTimeAgo(transaction.date)}</span>
                        </div>
                      </div>
                    </div>
                    <motion.span
                      className={`${isCompact ? 'text-sm' : 'text-base'} font-semibold ${transaction.amount < 0 ? "text-destructive" : "text-chart-1"}`}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.1 + 0.2 }}
                    >
                      {transaction.amount < 0 ? "-" : "+"}{formatCurrency(Math.abs(transaction.amount), settings.currency, settings.showCents)}
                    </motion.span>
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
