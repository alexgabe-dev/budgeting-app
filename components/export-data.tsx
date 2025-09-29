"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileText, Database } from "lucide-react"
import type { Transaction } from "@/lib/database"
import { useSettingsStore, formatCurrency } from "@/lib/settings-store"

interface ExportDataProps {
  transactions: Transaction[]
  dateRange: { start: Date; end: Date }
}

export function ExportData({ transactions, dateRange }: ExportDataProps) {
  const { settings } = useSettingsStore()
  
  const filteredTransactions = transactions.filter(
    (t) => new Date(t.date) >= dateRange.start && new Date(t.date) <= dateRange.end,
  )

  const exportToCSV = () => {
    const headers = ["Date", "Description", "Amount", "Category", "Type"]
    const csvData = filteredTransactions.map((t) => [
      new Date(t.date).toLocaleDateString(),
      t.description,
      t.amount.toString(),
      t.category,
      t.type,
    ])

    const csvContent = [headers, ...csvData].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `transactions_${dateRange.start.toISOString().split("T")[0]}_to_${dateRange.end.toISOString().split("T")[0]}.csv`,
    )
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToJSON = () => {
    const exportData = {
      dateRange: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
      transactions: filteredTransactions,
      summary: {
        totalTransactions: filteredTransactions.length,
        totalIncome: filteredTransactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
        totalExpenses: Math.abs(filteredTransactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)),
        exportedAt: new Date().toISOString(),
      },
    }

    const jsonContent = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `budget_report_${dateRange.start.toISOString().split("T")[0]}_to_${dateRange.end.toISOString().split("T")[0]}.json`,
    )
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const generateReport = () => {
    const totalIncome = filteredTransactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = Math.abs(
      filteredTransactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0),
    )
    const netIncome = totalIncome - totalExpenses

    // Category breakdown
    const categorySpending: Record<string, number> = {}
    filteredTransactions
      .filter((t) => t.amount < 0)
      .forEach((t) => {
        categorySpending[t.category] = (categorySpending[t.category] || 0) + Math.abs(t.amount)
      })

    const reportContent = `
FINANCIAL REPORT
Period: ${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}
Generated: ${new Date().toLocaleString()}

SUMMARY
=======
Total Income: ${formatCurrency(totalIncome, settings.currency, settings.showCents)}
Total Expenses: ${formatCurrency(totalExpenses, settings.currency, settings.showCents)}
Net Income: ${formatCurrency(netIncome, settings.currency, settings.showCents)}
Savings Rate: ${totalIncome > 0 ? ((netIncome / totalIncome) * 100).toFixed(1) : 0}%
Total Transactions: ${filteredTransactions.length}

SPENDING BY CATEGORY
===================
${Object.entries(categorySpending)
  .sort(([, a], [, b]) => b - a)
  .map(([category, amount]) => `${category}: ${formatCurrency(amount, settings.currency, settings.showCents)}`)
  .join("\n")}

RECENT TRANSACTIONS
==================
${filteredTransactions
  .slice(0, 10)
  .map(
    (t) =>
      `${new Date(t.date).toLocaleDateString()} | ${t.description} | ${t.amount < 0 ? "-" : "+"}${formatCurrency(Math.abs(t.amount), settings.currency, settings.showCents)} | ${t.category}`,
  )
  .join("\n")}
${filteredTransactions.length > 10 ? `\n... and ${filteredTransactions.length - 10} more transactions` : ""}
    `.trim()

    const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `financial_report_${dateRange.start.toISOString().split("T")[0]}_to_${dateRange.end.toISOString().split("T")[0]}.txt`,
    )
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Data</CardTitle>
        <CardDescription>
          Download your financial data in various formats ({filteredTransactions.length} transactions)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={exportToCSV}
            variant="outline"
            className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent"
          >
            <Download className="w-6 h-6" />
            <div className="text-center">
              <p className="font-medium">Export CSV</p>
              <p className="text-xs text-muted-foreground">Spreadsheet format</p>
            </div>
          </Button>

          <Button
            onClick={exportToJSON}
            variant="outline"
            className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent"
          >
            <Database className="w-6 h-6" />
            <div className="text-center">
              <p className="font-medium">Export JSON</p>
              <p className="text-xs text-muted-foreground">Data format</p>
            </div>
          </Button>

          <Button
            onClick={generateReport}
            variant="outline"
            className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent"
          >
            <FileText className="w-6 h-6" />
            <div className="text-center">
              <p className="font-medium">Generate Report</p>
              <p className="text-xs text-muted-foreground">Text summary</p>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
