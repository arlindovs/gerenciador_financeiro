import { motion } from 'framer-motion'
import { Edit3, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TransactionCardProps {
    transaction: any
    onEdit: (transaction: any) => void
    onDelete: (id: string) => void
}

/**
 * Modern Transaction List Item.
 * Item de lista de transação moderno.
 */
export default function TransactionCard({ transaction, onEdit, onDelete }: TransactionCardProps) {
    const isIncome = transaction.type === 'income'

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group relative flex items-center gap-4 p-4 hover:bg-muted/30 transition-all rounded-3xl border border-transparent hover:border-border/50"
        >
            {/* Category Icon */}
            <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${isIncome ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                }`}>
                {transaction.categories?.icon || '📁'}
            </div>

            {/* Description and Category */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground truncate">{transaction.description}</h3>
                    <div className="flex gap-1">
                        {transaction.installment_number && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-500/10 text-amber-600 rounded-lg">
                                {transaction.installment_number}/{transaction.total_installments}
                            </span>
                        )}
                        {transaction.is_recurring && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-500/10 text-blue-600 rounded-lg">
                                Recorrente
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm text-muted-foreground font-medium">
                        {transaction.categories?.name || 'Geral'}
                    </span>
                    <span className="text-[10px] text-muted-foreground/50">•</span>
                    <span className="text-xs text-muted-foreground/60">
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                    </span>
                </div>
            </div>

            {/* Amount and Actions */}
            <div className="flex flex-col items-end gap-1">
                <span className={`font-black text-lg tabular-nums tracking-tight ${isIncome ? 'text-revenue' : 'text-expense'}`}>
                    {isIncome ? '+' : '-'} R$ {Number(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>

                {/* Action Buttons (Always Visible) */}
                <div className="flex items-center gap-1 transition-opacity">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() => onEdit(transaction)}
                    >
                        <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onDelete(transaction.id)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </motion.div>
    )
}
