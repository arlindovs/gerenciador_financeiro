
import { Elysia, t } from 'elysia'
import { createClient } from '@supabase/supabase-js'
import { supabase as defaultSupabase } from '../lib/supabase'

export const transactionsRoutes = new Elysia({ prefix: '/transactions' })
    .get('/', async ({ headers }) => {
        const authHeader = headers['authorization']
        const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

        const client = token ? createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
            global: { headers: { Authorization: `Bearer ${token}` } }
        }) : defaultSupabase

        const { data, error } = await client
            .from('transactions')
            .select('*, categories(*)')
            .order('date', { ascending: false })

        if (error) throw error
        return data
    })
    .post('/', async ({ body, headers }) => {
        const {
            description, amount, type, category_id, date, user_id,
            total_installments, is_recurring, recurrence_period
        } = body as any

        const authHeader = headers['authorization']
        const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

        const client = token ? createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
            global: { headers: { Authorization: `Bearer ${token}` } }
        }) : defaultSupabase

        const installmentsToCreate = total_installments && total_installments > 1 ? total_installments : 1
        const results = []

        // If it's a single transaction (not installments), create it once
        if (installmentsToCreate === 1) {
            const { data, error } = await client
                .from('transactions')
                .insert([
                    {
                        description,
                        amount,
                        type,
                        category_id,
                        date,
                        user_id,
                        is_recurring: !!is_recurring,
                        recurrence_period: recurrence_period || 'monthly'
                    }
                ])
                .select()

            if (error) throw error
            return data[0]
        }

        // Installments logic
        const firstInstallmentDate = new Date(date)
        const amountPerInstallment = amount / installmentsToCreate

        const { data: parentData, error: parentError } = await client
            .from('transactions')
            .insert([
                {
                    description: `${description} (1/${installmentsToCreate})`,
                    amount: amountPerInstallment,
                    type,
                    category_id,
                    date,
                    user_id,
                    installment_number: 1,
                    total_installments: installmentsToCreate
                }
            ])
            .select()

        if (parentError) throw parentError
        const parentId = parentData[0].id
        results.push(parentData[0])

        // Create remaining installments
        const otherInstallments = []
        for (let i = 2; i <= installmentsToCreate; i++) {
            const nextDate = new Date(firstInstallmentDate)
            nextDate.setMonth(nextDate.getMonth() + (i - 1))

            otherInstallments.push({
                description: `${description} (${i}/${installmentsToCreate})`,
                amount: amountPerInstallment,
                type,
                category_id,
                date: nextDate.toISOString().split('T')[0],
                user_id,
                installment_number: i,
                total_installments: installmentsToCreate,
                parent_transaction_id: parentId
            })
        }

        const { data: childrenData, error: childrenError } = await client
            .from('transactions')
            .insert(otherInstallments)
            .select()

        if (childrenError) throw childrenError
        results.push(...childrenData)

        return results[0]
    }, {
        body: t.Object({
            description: t.String(),
            amount: t.Number(),
            type: t.String(),
            category_id: t.Optional(t.String()),
            date: t.String(),
            user_id: t.String(),
            total_installments: t.Optional(t.Number()),
            is_recurring: t.Optional(t.Boolean()),
            recurrence_period: t.Optional(t.String())
        })
    })
    .delete('/:id', async ({ params: { id }, headers }) => {
        const authHeader = headers['authorization']
        const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

        const client = token ? createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
            global: { headers: { Authorization: `Bearer ${token}` } }
        }) : defaultSupabase

        const { error } = await client
            .from('transactions')
            .delete()
            .eq('id', id)

        if (error) throw error
        return { success: true }
    })
    .put('/:id', async ({ params: { id }, body, headers }) => {
        const {
            description, amount, type, category_id, date
        } = body as any

        const authHeader = headers['authorization']
        const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

        const client = token ? createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
            global: { headers: { Authorization: `Bearer ${token}` } }
        }) : defaultSupabase

        const { data, error } = await client
            .from('transactions')
            .update({
                description,
                amount,
                type,
                category_id,
                date
            })
            .eq('id', id)
            .select()

        if (error) throw error
        return data[0]
    }, {
        body: t.Object({
            description: t.String(),
            amount: t.Number(),
            type: t.String(),
            category_id: t.Optional(t.String()),
            date: t.String()
        })
    })
