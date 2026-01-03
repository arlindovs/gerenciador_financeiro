/**
 * Zod Validation Schemas for API Requests
 * Schemas de Validação Zod para Requisições da API
 */
import { z } from 'zod'

/**
 * Transaction creation schema
 * Schema de criação de transação
 */
export const createTransactionSchema = z.object({
    description: z.string().min(1, 'Description is required'),
    amount: z.number().positive('Amount must be positive'),
    type: z.enum(['income', 'expense'], {
        errorMap: () => ({ message: 'Type must be income or expense' })
    }),
    category_id: z.string().uuid().optional(),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format',
    }),
    user_id: z.string().uuid('Invalid user ID'),
    total_installments: z.number().int().min(1).optional(),
    is_recurring: z.boolean().optional(),
    recurrence_period: z.enum(['weekly', 'monthly', 'yearly']).optional(),
})

/**
 * Transaction update schema
 * Schema de atualização de transação
 */
export const updateTransactionSchema = z.object({
    description: z.string().min(1, 'Description is required'),
    amount: z.number().positive('Amount must be positive'),
    type: z.enum(['income', 'expense'], {
        errorMap: () => ({ message: 'Type must be income or expense' })
    }),
    category_id: z.string().uuid().optional().nullable(),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format',
    }),
})

/**
 * AI categorization schema
 * Schema de categorização por IA
 */
export const categorizeSchema = z.object({
    description: z.string().min(1, 'Description is required'),
    amount: z.number().positive('Amount must be positive'),
})

// Type exports for use in routes
// Exportação de tipos para uso nas rotas
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>
export type CategorizeInput = z.infer<typeof categorizeSchema>
