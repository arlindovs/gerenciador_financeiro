
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import TransactionForm from '@/components/TransactionForm'

interface TransactionModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    userId: string
    onSuccess: () => void
    initialData?: any
}

export default function TransactionModal({ isOpen, onOpenChange, userId, onSuccess, initialData }: TransactionModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Editar Lançamento' : 'Novo Lançamento'}</DialogTitle>
                    <DialogClose onClick={() => onOpenChange(false)} />
                </DialogHeader>
                <div className="pt-2">
                    <TransactionForm
                        user_id={userId}
                        initialData={initialData}
                        onSuccess={() => {
                            onSuccess()
                            onOpenChange(false)
                        }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}
