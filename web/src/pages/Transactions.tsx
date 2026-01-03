import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Receipt, Search, ChevronLeft, ChevronRight, ArrowUpCircle, ArrowDownCircle, Calendar, X, Filter } from 'lucide-react'
import TransactionModal from '@/components/TransactionModal'
import TransactionCard from '@/components/TransactionCard'
import { AnimatePresence } from 'framer-motion'

export default function Transactions() {
    const [transactions, setTransactions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')

    // Date Filtering State
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingTransaction, setEditingTransaction] = useState<any>(null)
    const [user, setUser] = useState<any>(null)

    const fetchTransactions = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('transactions')
            .select('*, categories(*)')
            .order('date', { ascending: false })

        if (data) setTransactions(data)
        setLoading(false)
    }

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) {
                setUser(data.user)
                fetchTransactions()
            }
        })
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta transação?')) return

        const { data: { session } } = await supabase.auth.getSession()
        const res = await fetch(`http://localhost:3000/transactions/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${session?.access_token}` }
        })

        if (res.ok) fetchTransactions()
        else alert('Erro ao excluir')
    }

    const handleEdit = (transaction: any) => {
        setEditingTransaction(transaction)
        setIsModalOpen(true)
    }

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.categories?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType = typeFilter === 'all' || t.type === typeFilter

        const transactionDate = new Date(t.date)
        const start = startDate ? new Date(startDate) : null
        const end = endDate ? new Date(endDate) : null

        transactionDate.setHours(0, 0, 0, 0)
        if (start) start.setHours(0, 0, 0, 0)
        if (end) end.setHours(23, 59, 59, 999)

        const matchesStartDate = !start || transactionDate >= start
        const matchesEndDate = !end || transactionDate <= end

        return matchesSearch && matchesType && matchesStartDate && matchesEndDate
    })

    return (
        <div className="space-y-8 pb-32">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter">Histórico</h1>
                    <p className="text-muted-foreground font-medium text-lg">Gerencie seus lançamentos.</p>
                </div>
                <Button
                    onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }}
                    className="shadow-2xl shadow-primary/20 gap-2 h-12 px-8 font-black rounded-2xl hover:scale-105 transition-all"
                >
                    <Receipt className="w-5 h-5" />
                    Novo Lançamento
                </Button>
            </header>

            <Card className="border-border/50 bg-card/30 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="p-6 space-y-6">
                    <div className="flex flex-col xl:flex-row gap-6 items-center justify-between">
                        <div className="relative w-full lg:w-max min-w-[320px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="O que você está procurando?..."
                                className="pl-12 h-14 bg-background/50 border-border/50 rounded-2xl focus-visible:ring-primary/20 text-lg font-medium"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col lg:flex-row items-center gap-4 w-full lg:w-auto">
                            {/* Modern Date Picker Simulation */}
                            <div className="flex items-center gap-3 bg-background/50 p-2 rounded-2xl border border-border/50 shadow-inner w-full lg:w-auto">
                                <Calendar className="w-4 h-4 text-muted-foreground ml-2" />
                                <Input
                                    type="date"
                                    className="h-10 border-none bg-transparent text-xs font-black uppercase w-full lg:w-36 focus-visible:ring-0"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                />
                                <span className="text-border">|</span>
                                <Input
                                    type="date"
                                    className="h-10 border-none bg-transparent text-xs font-black uppercase w-full lg:w-36 focus-visible:ring-0"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                />
                                {(startDate || endDate) && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-xl text-muted-foreground"
                                        onClick={() => { setStartDate(''); setEndDate(''); }}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>

                            <div className="flex items-center gap-2 bg-background/50 p-2 rounded-2xl border border-border/50 shadow-inner w-full lg:w-auto overflow-x-auto whitespace-nowrap">
                                <Button
                                    variant={typeFilter === 'all' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className={`h-10 font-black text-xs px-4 rounded-xl ${typeFilter === 'all' ? 'shadow-sm' : ''}`}
                                    onClick={() => setTypeFilter('all')}
                                >
                                    Todos
                                </Button>
                                <Button
                                    variant={typeFilter === 'income' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className={`h-10 font-black text-xs px-4 rounded-xl gap-2 ${typeFilter === 'income' ? 'shadow-sm text-revenue' : 'text-muted-foreground'}`}
                                    onClick={() => setTypeFilter('income')}
                                >
                                    <ArrowUpCircle className="w-4 h-4" />
                                    Entradas
                                </Button>
                                <Button
                                    variant={typeFilter === 'expense' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className={`h-10 font-black text-xs px-4 rounded-xl gap-2 ${typeFilter === 'expense' ? 'shadow-sm text-expense' : 'text-muted-foreground'}`}
                                    onClick={() => setTypeFilter('expense')}
                                >
                                    <ArrowDownCircle className="w-4 h-4" />
                                    Saídas
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 pt-2">
                        <AnimatePresence mode="popLayout">
                            {loading ? (
                                <div className="py-20 text-center text-muted-foreground font-black uppercase tracking-widest opacity-20">
                                    Processando...
                                </div>
                            ) : filteredTransactions.length > 0 ? (
                                filteredTransactions.map((t) => (
                                    <TransactionCard
                                        key={t.id}
                                        transaction={t}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                ))
                            ) : (
                                <div className="py-32 flex flex-col items-center gap-6 text-center">
                                    <div className="w-24 h-24 bg-muted/30 rounded-[2rem] flex items-center justify-center">
                                        <Filter className="w-10 h-10 text-muted-foreground/30" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-black text-xl tracking-tight">Vazio por aqui</p>
                                        <p className="text-muted-foreground text-sm font-medium">Nenhuma transação atende aos filtros atuais.</p>
                                    </div>
                                    <Button variant="outline" className="rounded-xl font-bold border-border/50" onClick={() => { setSearchTerm(''); setTypeFilter('all'); setStartDate(''); setEndDate(''); }}>
                                        Limpar Filtros
                                    </Button>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <footer className="p-6 bg-muted/20 border-t border-border/50 flex items-center justify-between">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Resultados: {filteredTransactions.length} de {transactions.length}</p>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" disabled><ChevronLeft className="w-5 h-5" /></Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" disabled><ChevronRight className="w-5 h-5" /></Button>
                    </div>
                </footer>
            </Card>

            {user && (
                <TransactionModal
                    isOpen={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    userId={user.id}
                    initialData={editingTransaction}
                    onSuccess={() => fetchTransactions()}
                />
            )}
        </div>
    )
}
