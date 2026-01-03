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
            className="group relative p-3 sm:p-4 hover:bg-muted/30 transition-all rounded-2xl sm:rounded-3xl border border-transparent hover:border-border/50"
        >
            {/* Mobile: Stacked layout / Desktop: Row layout */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                {/* Left: Icon + Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Category Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-lg sm:text-xl shadow-inner ${isIncome ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}>
                        {transaction.categories?.icon || '📁'}
                    </div>

                    {/* Description, tags, category, date */}
                    <div className="flex-1 min-w-0 overflow-hidden">
                        {/* Description + Tags */}
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm sm:text-base text-foreground truncate">{transaction.description}</h3>
                            {transaction.installment_number && (
                                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 bg-amber-500/10 text-amber-600 rounded flex-shrink-0">
                                    {transaction.installment_number}/{transaction.total_installments}
                                </span>
                            )}
                            {transaction.is_recurring && (
                                <span className="hidden sm:inline text-[10px] font-bold px-1.5 py-0.5 bg-blue-500/10 text-blue-600 rounded flex-shrink-0">
                                    Recorrente
                                </span>
                            )}
                        </div>
                        {/* Category + Date */}
                        <div className="flex items-center gap-1.5 mt-0.5 text-muted-foreground">
                            <span className="text-xs font-medium truncate">
                                {transaction.categories?.name || 'Geral'}
                            </span>
                            <span className="text-[10px] opacity-50">•</span>
                            <span className="text-[10px] sm:text-xs opacity-60 flex-shrink-0">
                                {new Date(transaction.date).toLocaleDateString('pt-BR')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Amount + Actions - on same level for mobile, stacked for desktop */}
                <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-1 pl-13 sm:pl-0 mt-1 sm:mt-0">
                    {/* Amount */}
                    <span className={`font-black text-sm sm:text-lg tabular-nums tracking-tight whitespace-nowrap ${isIncome ? 'text-revenue' : 'text-expense'}`}>
                        {isIncome ? '+' : '-'} R$ {Number(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
                            onClick={() => onEdit(transaction)}
                        >
                            <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => onDelete(transaction.id)}
                        >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
