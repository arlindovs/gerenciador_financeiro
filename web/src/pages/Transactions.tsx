
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Receipt, Search, Trash2, Edit3, ChevronLeft, ChevronRight, ArrowUpCircle, ArrowDownCircle, Calendar } from 'lucide-react'
import TransactionModal from '@/components/TransactionModal'

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

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) {
                setUser(data.user)
                fetchTransactions()
            }
        })
    }, [])

    async function fetchTransactions() {
        setLoading(true)
        const { data } = await supabase
            .from('transactions')
            .select('*, categories(*)')
            .order('date', { ascending: false })

        if (data) setTransactions(data)
        setLoading(false)
    }

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

        // Date range filtering
        const transactionDate = new Date(t.date)
        const start = startDate ? new Date(startDate) : null
        const end = endDate ? new Date(endDate) : null

        // Reset hours for accurate date comparison
        transactionDate.setHours(0, 0, 0, 0)
        if (start) start.setHours(0, 0, 0, 0)
        if (end) end.setHours(23, 59, 59, 999)

        const matchesStartDate = !start || transactionDate >= start
        const matchesEndDate = !end || transactionDate <= end

        return matchesSearch && matchesType && matchesStartDate && matchesEndDate
    })

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Transações</h1>
                    <p className="text-slate-500 font-medium">Gerencie detalhadamente seu histórico financeiro.</p>
                </div>
                <Button onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }} className="shadow-lg shadow-primary/20 gap-2 h-11 px-6 font-bold">
                    <Receipt className="w-5 h-5" />
                    Nova Transação
                </Button>
            </div>

            <Card className="border-border/50 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-border/50 py-4">
                    <div className="flex flex-col xl:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full lg:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Buscar por descrição ou categoria..."
                                className="pl-10 h-10 bg-white border-slate-200 focus-visible:ring-primary/20"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto">
                            {/* Date Filter Inputs */}
                            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm w-full md:w-auto">
                                <div className="flex items-center gap-1.5 px-2 text-slate-400">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <Input
                                    type="date"
                                    className="h-8 border-none bg-transparent text-xs font-medium w-full md:w-32 focus-visible:ring-0"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                />
                                <span className="text-slate-300">|</span>
                                <Input
                                    type="date"
                                    className="h-8 border-none bg-transparent text-xs font-medium w-full md:w-32 focus-visible:ring-0"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                />
                                {(startDate || endDate) && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600"
                                        onClick={() => { setStartDate(''); setEndDate(''); }}
                                    >
                                        <X size={14} />
                                    </Button>
                                )}
                            </div>

                            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm w-full md:w-auto overflow-x-auto">
                                <Button
                                    variant={typeFilter === 'all' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className="h-8 font-bold text-xs flex-1 md:flex-none"
                                    onClick={() => setTypeFilter('all')}
                                >
                                    Todos
                                </Button>
                                <Button
                                    variant={typeFilter === 'income' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className="h-8 font-bold text-xs text-emerald-600 gap-1.5 flex-1 md:flex-none"
                                    onClick={() => setTypeFilter('income')}
                                >
                                    <ArrowUpCircle className="w-3.5 h-3.5" />
                                    Entradas
                                </Button>
                                <Button
                                    variant={typeFilter === 'expense' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className="h-8 font-bold text-xs text-rose-600 gap-1.5 flex-1 md:flex-none"
                                    onClick={() => setTypeFilter('expense')}
                                >
                                    <ArrowDownCircle className="w-3.5 h-3.5" />
                                    Saídas
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                                    <TableHead className="w-[120px] font-bold text-slate-700">Data</TableHead>
                                    <TableHead className="font-bold text-slate-700">Descrição</TableHead>
                                    <TableHead className="font-bold text-slate-700">Categoria</TableHead>
                                    <TableHead className="text-right font-bold text-slate-700">Valor</TableHead>
                                    <TableHead className="w-[100px] text-right font-bold text-slate-700">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-20 text-slate-500">
                                            Carregando transações...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredTransactions.length > 0 ? (
                                    filteredTransactions.map(t => (
                                        <TableRow key={t.id} className="hover:bg-slate-50/30 transition-colors">
                                            <TableCell className="font-medium text-slate-600">
                                                {new Date(t.date).toLocaleDateString('pt-BR')}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 leading-tight">{t.description}</span>
                                                    <div className="flex gap-1.5 mt-1.5">
                                                        {t.installment_number && (
                                                            <span className="text-[9px] font-black px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-md uppercase tracking-wider">
                                                                {t.installment_number}/{t.total_installments}
                                                            </span>
                                                        )}
                                                        {t.is_recurring && (
                                                            <span className="text-[9px] font-black px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-md uppercase tracking-wider">
                                                                Recorrente
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-white text-slate-800 border border-slate-200 shadow-sm">
                                                    <span className="mr-1.5">{t.categories?.icon || '📁'}</span>
                                                    {t.categories?.name || 'Geral'}
                                                </span>
                                            </TableCell>
                                            <TableCell className={`text-right font-black text-lg ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {t.type === 'income' ? '+' : '-'} R$ {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-primary hover:bg-primary/5 transition-all" onClick={() => handleEdit(t)}>
                                                        <Edit3 className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-destructive hover:bg-destructive/5 transition-all" onClick={() => handleDelete(t.id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-24">
                                            <div className="flex flex-col items-center gap-3 text-slate-400">
                                                <Receipt className="w-16 h-16 opacity-10" />
                                                <p className="font-bold text-lg opacity-40">Nenhuma transação encontrada.</p>
                                                <Button variant="outline" size="sm" onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }} className="mt-2 font-bold">Começar agora</Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <div className="bg-slate-50/50 border-t border-border/50 p-4 flex items-center justify-between">
                    <p className="text-sm text-slate-500 font-bold">Mostrando {filteredTransactions.length} de {transactions.length} transações</p>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" disabled><ChevronLeft className="w-4 h-4" /></Button>
                        <Button variant="outline" size="icon" className="h-8 w-8" disabled><ChevronRight className="w-4 h-4" /></Button>
                    </div>
                </div>
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

// Adding missing Lucide X component
function X({ size }: { size: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
    )
}
