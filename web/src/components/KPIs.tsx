import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingDown, TrendingUp, Wallet, Zap } from "lucide-react"
import { motion, animate } from "framer-motion"
import { useEffect, useState } from "react"

/**
 * CountUp component for numerical animations.
 * Componente de contagem progressiva para animações numéricas.
 */
export function CountUp({ value, prefix = "", suffix = "", decimals = 2 }: { value: number, prefix?: string, suffix?: string, decimals?: number }) {
    const [displayValue, setDisplayValue] = useState(0)

    useEffect(() => {
        const controls = animate(0, value, {
            duration: 1.5,
            ease: "easeOut",
            onUpdate: (latest) => setDisplayValue(latest)
        })
        return () => controls.stop()
    }, [value])

    return (
        <span className="tabular-nums">
            {prefix}{displayValue.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
        </span>
    )
}

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

    // Burn Rate
    const totalExpensesCurrentMonth = currentMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + Number(t.amount), 0)

    const daysPassed = today.getDate()
    const burnRate = daysPassed > 0 ? totalExpensesCurrentMonth / daysPassed : 0

    // Savings Rate
    const totalIncomeCurrentMonth = currentMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + Number(t.amount), 0)

    const savingsRate = totalIncomeCurrentMonth > 0
        ? ((totalIncomeCurrentMonth - totalExpensesCurrentMonth) / totalIncomeCurrentMonth) * 100
        : 0

    // MoM
    const totalExpensesPrevMonth = prevMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + Number(t.amount), 0)

    const momChange = totalExpensesPrevMonth > 0
        ? ((totalExpensesCurrentMonth - totalExpensesPrevMonth) / totalExpensesPrevMonth) * 100
        : 0

    const kpis = [
        {
            title: "Burn Rate",
            value: burnRate,
            prefix: "R$ ",
            subtitle: "Média de gastos/dia este mês",
            icon: Zap,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            gradient: "from-orange-500/10 to-transparent"
        },
        {
            title: "Taxa de Economia",
            value: savingsRate,
            suffix: "%",
            subtitle: "Do que entra, você guarda isso",
            icon: Wallet,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            gradient: "from-blue-500/10 to-transparent"
        },
        {
            title: "Comparativo (MoM)",
            value: Math.abs(momChange),
            suffix: momChange <= 0 ? "% a menos" : "% a mais",
            subtitle: "Em relação ao mês anterior",
            icon: momChange <= 0 ? TrendingDown : TrendingUp,
            color: momChange <= 0 ? "text-emerald-500" : "text-rose-500",
            bg: momChange <= 0 ? "bg-emerald-500/10" : "bg-rose-500/10",
            gradient: momChange <= 0 ? "from-emerald-500/10 to-transparent" : "from-rose-500/10 to-transparent"
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {kpis.map((kpi, idx) => (
                <motion.div
                    key={kpi.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                >
                    <Card className="relative overflow-hidden border-border/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group rounded-3xl">
                        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${kpi.bg} blur-3xl opacity-50 group-hover:opacity-100 transition-opacity`} />
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">{kpi.title}</CardTitle>
                            <div className={`p-2 rounded-2xl ${kpi.bg} ${kpi.color}`}>
                                <kpi.icon className="h-5 w-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-xl sm:text-2xl md:text-3xl font-black tracking-tighter ${idx === 2 ? kpi.color : 'text-foreground'}`}>
                                <CountUp value={kpi.value} prefix={kpi.prefix} suffix={kpi.suffix} decimals={kpi.title.includes('Economia') ? 1 : 2} />
                            </div>
                            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 font-medium">{kpi.subtitle}</p>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    )
}
