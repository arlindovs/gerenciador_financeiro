import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    PieChart, Pie, Cell, AreaChart, Area, LineChart, Line
} from 'recharts'
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, PieChartIcon, BarChart3, Activity, Repeat, ArrowUpDown } from 'lucide-react'
import { motion } from 'framer-motion'

/**
 * Professional Charts Page for detailed financial analysis.
 * Página de gráficos profissionais para análise financeira detalhada.
 */

interface Transaction {
    id: string
    description: string
    amount: number
    date: string
    type: 'income' | 'expense'
    categories?: { name: string; icon?: string }
    is_recurring: boolean
}

const CHART_COLORS = {
    income: '#22c55e',
    expense: '#ef4444',
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    muted: 'hsl(var(--muted-foreground))'
}

const CATEGORY_COLORS = [
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
    '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1'
]

export default function Charts() {
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
    const [categoryTab, setCategoryTab] = useState<'expense' | 'income'>('expense')
    const navigate = useNavigate()

    const fetchTransactions = async () => {
        const { data } = await supabase
            .from('transactions')
            .select('*, categories(*)')
            .order('date', { ascending: true })

        if (data) {
            setAllTransactions(data as Transaction[])
        }
    }

    useEffect(() => {
        supabase.auth.getUser().then(({ data }: { data: { user: any } }) => {
            if (!data.user) {
                navigate('/login')
            } else {
                fetchTransactions()
            }
        })
    }, [navigate])

    // Filter transactions for the current year
    // Filtrar transações do ano atual
    const yearTransactions = useMemo(() => {
        return allTransactions.filter(t => {
            const d = new Date(t.date)
            return d.getFullYear() === currentYear
        })
    }, [allTransactions, currentYear])

    // 1. Monthly Comparison Bar Chart Data (Income vs Expenses by month)
    // 1. Dados do gráfico de barras comparativo mensal
    const monthlyComparisonData = useMemo(() => {
        const months: { name: string; income: number; expense: number }[] = []
        for (let i = 0; i < 12; i++) {
            const monthName = new Date(currentYear, i).toLocaleDateString('pt-BR', { month: 'short' })
            months.push({ name: monthName, income: 0, expense: 0 })
        }

        yearTransactions.forEach(t => {
            const d = new Date(t.date)
            const monthIndex = d.getMonth()
            if (t.type === 'income') {
                months[monthIndex].income += Number(t.amount)
            } else {
                months[monthIndex].expense += Number(t.amount)
            }
        })

        return months
    }, [yearTransactions, currentYear])

    // 2. Category Distribution Data (Donut Chart)
    // 2. Dados de distribuição por categoria
    const categoryDistributionData = useMemo(() => {
        const filteredTransactions = yearTransactions.filter(t => t.type === categoryTab)
        const categories: Record<string, number> = {}

        filteredTransactions.forEach(t => {
            const catName = t.categories?.name || 'Outros'
            categories[catName] = (categories[catName] || 0) + Number(t.amount)
        })

        return Object.entries(categories)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
    }, [yearTransactions, categoryTab])

    // 3. Cash Flow Area Chart (Cumulative balance over time)
    // 3. Gráfico de área do fluxo de caixa
    const cashFlowData = useMemo(() => {
        let balance = 0
        const sortedTransactions = [...yearTransactions].sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        )

        const monthlyBalance: { name: string; balance: number; income: number; expense: number }[] = []
        for (let i = 0; i < 12; i++) {
            const monthName = new Date(currentYear, i).toLocaleDateString('pt-BR', { month: 'short' })
            monthlyBalance.push({ name: monthName, balance: 0, income: 0, expense: 0 })
        }

        sortedTransactions.forEach(t => {
            const d = new Date(t.date)
            const monthIndex = d.getMonth()
            if (t.type === 'income') {
                balance += Number(t.amount)
                monthlyBalance[monthIndex].income += Number(t.amount)
            } else {
                balance -= Number(t.amount)
                monthlyBalance[monthIndex].expense += Number(t.amount)
            }
            monthlyBalance[monthIndex].balance = balance
        })

        // Propagate balance to future months
        // Propagar saldo para meses futuros
        for (let i = 1; i < 12; i++) {
            if (monthlyBalance[i].balance === 0 && monthlyBalance[i - 1].balance !== 0) {
                monthlyBalance[i].balance = monthlyBalance[i - 1].balance
            }
        }

        return monthlyBalance
    }, [yearTransactions, currentYear])

    // 4. Top 5 Expenses (Horizontal Bar Chart)
    // 4. Top 5 maiores gastos
    const topExpensesData = useMemo(() => {
        return yearTransactions
            .filter(t => t.type === 'expense')
            .sort((a, b) => Number(b.amount) - Number(a.amount))
            .slice(0, 5)
            .map(t => ({
                name: t.description.length > 20 ? t.description.substring(0, 20) + '...' : t.description,
                value: Number(t.amount),
                category: t.categories?.name || 'Outros'
            }))
    }, [yearTransactions])

    // 5. Recurring vs One-time Expenses
    // 5. Gastos recorrentes vs avulsos
    const recurringVsOneTimeData = useMemo(() => {
        const recurring = yearTransactions
            .filter(t => t.type === 'expense' && t.is_recurring)
            .reduce((acc, t) => acc + Number(t.amount), 0)

        const oneTime = yearTransactions
            .filter(t => t.type === 'expense' && !t.is_recurring)
            .reduce((acc, t) => acc + Number(t.amount), 0)

        return [
            { name: 'Recorrentes', value: recurring },
            { name: 'Avulsos', value: oneTime }
        ].filter(d => d.value > 0)
    }, [yearTransactions])

    // 6. Spending Trend (Line Chart with projection)
    // 6. Tendência de gastos com projeção
    const spendingTrendData = useMemo(() => {
        const currentMonth = new Date().getMonth()
        const data = monthlyComparisonData.map((m, idx) => ({
            ...m,
            projected: idx > currentMonth ? monthlyComparisonData.slice(0, currentMonth + 1).reduce((acc, curr) => acc + curr.expense, 0) / (currentMonth + 1) : undefined
        }))
        return data
    }, [monthlyComparisonData])

    const nextYear = () => setCurrentYear(currentYear + 1)
    const prevYear = () => setCurrentYear(currentYear - 1)

    const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-card/95 backdrop-blur-lg border border-border/50 p-4 rounded-2xl shadow-xl">
                    <p className="font-bold text-foreground mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
                            {entry.name}: {formatCurrency(entry.value)}
                        </p>
                    ))}
                </div>
            )
        }
        return null
    }

    const chartCardClass = "rounded-[2rem] border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300"

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-foreground">Gráficos</h1>
                    <p className="text-muted-foreground font-medium text-lg">Análise detalhada das suas finanças.</p>
                </div>

                {/* Year Selector */}
                <div className="flex items-center gap-1 bg-card/50 backdrop-blur-xl p-1.5 rounded-2xl border border-border/50 shadow-xl self-stretch md:self-auto">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-muted" onClick={prevYear}>
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-3 px-4 min-w-[120px] justify-center">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-sm font-black tracking-tight">{currentYear}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-muted" onClick={nextYear}>
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>
            </header>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* 1. Monthly Comparison Bar Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className={chartCardClass}>
                        <CardHeader className="flex flex-row items-center gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-2xl text-primary">
                                <BarChart3 className="w-5 h-5" />
                            </div>
                            <CardTitle className="text-lg font-bold">Comparativo Mensal</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyComparisonData} barGap={4}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend verticalAlign="top" height={40} />
                                    <Bar dataKey="income" name="Receitas" fill={CHART_COLORS.income} radius={[8, 8, 0, 0]} />
                                    <Bar dataKey="expense" name="Despesas" fill={CHART_COLORS.expense} radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* 2. Category Distribution Donut Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className={chartCardClass}>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-violet-500/10 rounded-2xl text-violet-500">
                                    <PieChartIcon className="w-5 h-5" />
                                </div>
                                <CardTitle className="text-lg font-bold">Distribuição por Categoria</CardTitle>
                            </div>
                            <div className="flex bg-muted/50 rounded-xl p-1 gap-1">
                                <Button
                                    size="sm"
                                    variant={categoryTab === 'expense' ? 'secondary' : 'ghost'}
                                    onClick={() => setCategoryTab('expense')}
                                    className="rounded-lg text-xs font-bold"
                                >
                                    Despesas
                                </Button>
                                <Button
                                    size="sm"
                                    variant={categoryTab === 'income' ? 'secondary' : 'ghost'}
                                    onClick={() => setCategoryTab('income')}
                                    className="rounded-lg text-xs font-bold"
                                >
                                    Receitas
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[320px] flex items-center justify-center">
                            {categoryDistributionData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryDistributionData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={3}
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                                            labelLine={false}
                                        >
                                            {categoryDistributionData.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number | undefined) => formatCurrency(value ?? 0)} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-muted-foreground italic">Sem dados para o período.</p>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* 3. Cash Flow Area Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className={chartCardClass}>
                        <CardHeader className="flex flex-row items-center gap-3">
                            <div className="p-2.5 bg-cyan-500/10 rounded-2xl text-cyan-500">
                                <Activity className="w-5 h-5" />
                            </div>
                            <CardTitle className="text-lg font-bold">Fluxo de Caixa</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={cashFlowData}>
                                    <defs>
                                        <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="balance"
                                        name="Saldo Acumulado"
                                        stroke="#06b6d4"
                                        strokeWidth={3}
                                        fill="url(#balanceGradient)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* 4. Top 5 Expenses */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className={chartCardClass}>
                        <CardHeader className="flex flex-row items-center gap-3">
                            <div className="p-2.5 bg-rose-500/10 rounded-2xl text-rose-500">
                                <ArrowUpDown className="w-5 h-5" />
                            </div>
                            <CardTitle className="text-lg font-bold">Top 5 Maiores Gastos</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[320px]">
                            {topExpensesData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topExpensesData} layout="vertical" barSize={24}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.2} />
                                        <XAxis type="number" axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 10 }} />
                                        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={120} tick={{ fontSize: 11 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="value" name="Valor" fill={CHART_COLORS.expense} radius={[0, 8, 8, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-muted-foreground italic">Sem despesas registradas.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* 5. Recurring vs One-time */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card className={chartCardClass}>
                        <CardHeader className="flex flex-row items-center gap-3">
                            <div className="p-2.5 bg-amber-500/10 rounded-2xl text-amber-500">
                                <Repeat className="w-5 h-5" />
                            </div>
                            <CardTitle className="text-lg font-bold">Recorrente vs Avulso</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[320px] flex items-center justify-center">
                            {recurringVsOneTimeData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={recurringVsOneTimeData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            <Cell fill="#f59e0b" />
                                            <Cell fill="#8b5cf6" />
                                        </Pie>
                                        <Tooltip formatter={(value: number | undefined) => formatCurrency(value ?? 0)} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-muted-foreground italic">Sem dados de despesas.</p>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* 6. Spending Trend */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Card className={chartCardClass}>
                        <CardHeader className="flex flex-row items-center gap-3">
                            <div className="p-2.5 bg-emerald-500/10 rounded-2xl text-emerald-500">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <CardTitle className="text-lg font-bold">Tendência de Gastos</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={spendingTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend verticalAlign="top" height={40} />
                                    <Line type="monotone" dataKey="expense" name="Gastos Reais" stroke={CHART_COLORS.expense} strokeWidth={3} dot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="projected" name="Projeção" stroke="#9ca3af" strokeWidth={2} strokeDasharray="8 4" dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

            </div>

            {/* Footer */}
            <footer className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                <p className="opacity-60">Baseado em {yearTransactions.length} transações • {currentYear}</p>
                <Button
                    variant="link"
                    onClick={() => navigate('/transactions')}
                    className="font-black text-primary hover:no-underline p-0 h-auto"
                >
                    Ver transações &rarr;
                </Button>
            </footer>
        </div>
    )
}
