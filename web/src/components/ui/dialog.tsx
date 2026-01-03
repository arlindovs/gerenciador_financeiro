
import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const Dialog = ({ children, open, onOpenChange }: { children: React.ReactNode, open: boolean, onOpenChange: (open: boolean) => void }) => {
    if (!open) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
            <div className="relative z-50 w-full max-w-lg scale-in-center animate-in fade-in duration-200">
                {children}
            </div>
        </div>
    )
}

const DialogContent = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("bg-card rounded-xl shadow-2xl overflow-hidden border border-border/50 p-6", className)}>
        {children}
    </div>
)

const DialogHeader = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left mb-4", className)}>
        {children}
    </div>
)

const DialogTitle = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <h2 className={cn("text-xl font-bold leading-none tracking-tight", className)}>
        {children}
    </h2>
)

const DialogClose = ({ onClick }: { onClick: () => void }) => (
    <button
        onClick={onClick}
        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
    >
        <X className="h-5 w-5 text-slate-400" />
        <span className="sr-only">Close</span>
    </button>
)

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose }
