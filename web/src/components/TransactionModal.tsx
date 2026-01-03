import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import TransactionForm from "@/components/TransactionForm"
import { useMediaQuery } from "@/hooks/use-media-query"
import { X } from "lucide-react"

interface TransactionModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    userId: string
    onSuccess: () => void
    initialData?: any
}

/**
 * Responsive Transaction Modal.
 * Uses a Dialog/Modal for desktop and a Drawer/Bottom Sheet for mobile.
 */
export default function TransactionModal({
    isOpen,
    onOpenChange,
    userId,
    onSuccess,
    initialData
}: TransactionModalProps) {
    const isDesktop = useMediaQuery("(min-width: 768px)")
    const title = initialData ? 'Editar Lançamento' : 'Novo Lançamento'

    const content = (
        <div className="px-4 pb-8 md:px-0 md:pb-0">
            <TransactionForm
                user_id={userId}
                initialData={initialData}
                onSuccess={() => {
                    onSuccess()
                    onOpenChange(false)
                }}
            />
        </div>
    )

    if (isDesktop) {
        return (
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[500px] p-8 rounded-[2rem] border-border/50 bg-card/90 backdrop-blur-xl shadow-2xl overflow-hidden">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-3xl font-black tracking-tighter">{title}</DialogTitle>
                    </DialogHeader>
                    {content}
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer open={isOpen} onOpenChange={onOpenChange}>
            <DrawerContent className="bg-card/90 backdrop-blur-xl border-border/50 rounded-t-[2.5rem]">
                <DrawerHeader className="text-left px-6 pt-8">
                    <div className="flex items-center justify-between">
                        <DrawerTitle className="text-2xl font-black tracking-tighter">{title}</DrawerTitle>
                        <DrawerClose asChild>
                            <Button variant="ghost" size="icon" className="rounded-full bg-muted/50">
                                <X className="w-5 h-5" />
                            </Button>
                        </DrawerClose>
                    </div>
                </DrawerHeader>
                <div className="overflow-y-auto max-h-[80vh] px-2">
                    {content}
                </div>
                <DrawerFooter className="pb-8">
                    {/* Optional footer content */}
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}
