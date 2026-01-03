import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    PieChart, Pie, Cell
} from 'recharts'

interface ChartsProps {
    transactions: any[]
}

interface TrendMonth {
    name: string;
    month: number;
    year: number;
    income: number;
    expense: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1']

export function FinanceCharts({ transactions }: ChartsProps) {

    // Preparation for Trend Chart (Last 6 months)
    const trendData = useMemo(() => {
        const months: TrendMonth[] = []
        for (let i = 5; i >= 0; i--) {
            const date = new Date()
            date.setMonth(date.getMonth() - i)
            months.push({
                name: date.toLocaleDateString('pt-BR', { month: 'short' }),
                month: date.getMonth(),
                year: date.getFullYear(),
                income: 0,
                expense: 0
            })
        }

        transactions.forEach(t => {
            const d = new Date(t.date)
            const entry = months.find(m => m.month === d.getMonth() && m.year === d.getFullYear())
            if (entry) {
                if (t.type === 'income') entry.income += Number(t.amount)
                else entry.expense += Number(t.amount)
            }
        })

        return months
    }, [transactions])

    // Preparation for Donut Chart (Expenses by Category - Current Month)
    const categoryData = useMemo(() => {
        const today = new Date()
        const currentMonthTransactions = transactions.filter(t => {
            const d = new Date(t.date)
            return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear() && t.type === 'expense'
        })

        const categories: Record<string, number> = {}
        currentMonthTransactions.forEach(t => {
            const catName = t.categories?.name || 'Outros'
            categories[catName] = (categories[catName] || 0) + Number(t.amount)
        })

        return Object.entries(categories).map(([name, value]) => ({ name, value }))
    }, [transactions])

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="hover:shadow-md transition-all">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Tendência (Receitas vs Despesas)</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `R$${value}`} />
                            <Tooltip
                                formatter={(value: number | undefined) => `R$ ${(value ?? 0).toFixed(2)}`}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                            />
                            <Legend verticalAlign="top" height={36} />
                            <Line type="monotone" dataKey="income" name="Receitas" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="expense" name="Despesas" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-all">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Gastos por Categoria (Este Mês)</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                    {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number | undefined) => `R$ ${(value ?? 0).toFixed(2)}`}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-muted-foreground italic">Sem dados de gastos este mês.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
