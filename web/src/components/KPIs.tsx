
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingDown, TrendingUp, Wallet, Zap } from "lucide-react"

interface KPIProps {
    transactions: any[]
}

export function KPIs({ transactions }: KPIProps) {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    const currentMonthTransactions = transactions.filter(t => {
        const d = new Date(t.date)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })

    const prevMonthTransactions = transactions.filter(t => {
        const d = new Date(t.date)
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
        return d.getMonth() === prevMonth && d.getFullYear() === prevYear
    })

    // 1. Burn Rate (Average daily spending this month)
    const totalExpensesCurrentMonth = currentMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + Number(t.amount), 0)

    const daysPassed = today.getDate()
    const burnRate = daysPassed > 0 ? totalExpensesCurrentMonth / daysPassed : 0

    // 2. Savings Rate ((Income - Expense) / Income)
    const totalIncomeCurrentMonth = currentMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + Number(t.amount), 0)

    const savingsRate = totalIncomeCurrentMonth > 0
        ? ((totalIncomeCurrentMonth - totalExpensesCurrentMonth) / totalIncomeCurrentMonth) * 100
        : 0

    // 3. MoM (Month over Month comparison)
    const totalExpensesPrevMonth = prevMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + Number(t.amount), 0)

    const momChange = totalExpensesPrevMonth > 0
        ? ((totalExpensesCurrentMonth - totalExpensesPrevMonth) / totalExpensesPrevMonth) * 100
        : 0

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="hover:shadow-md transition-shadow border-t-4 border-t-orange-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Burn Rate</CardTitle>
                    <Zap className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">R$ {burnRate.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Média de gastos/dia este mês</p>
                </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow border-t-4 border-t-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Taxa de Economia</CardTitle>
                    <Wallet className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{savingsRate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">Do que entra, você guarda isso</p>
                </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow border-t-4 border-t-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Comparativo Mensal (MoM)</CardTitle>
                    {momChange <= 0 ? (
                        <TrendingDown className="h-4 w-4 text-green-500" />
                    ) : (
                        <TrendingUp className="h-4 w-4 text-red-500" />
                    )}
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${momChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(momChange).toFixed(1)}% {momChange <= 0 ? 'a menos' : 'a mais'}
                    </div>
                    <p className="text-xs text-muted-foreground">Em relação ao mês anterior</p>
                </CardContent>
            </Card>
        </div>
    )
}
