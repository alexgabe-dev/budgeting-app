import { TransactionList } from "@/components/transaction-list"
import { DashboardHeader } from "@/components/dashboard-header"

export default function TransactionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-6">
        <TransactionList />
      </main>
    </div>
  )
}
