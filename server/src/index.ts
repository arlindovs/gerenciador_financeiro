
import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { transactionsRoutes } from './routes/transactions'
import { aiRoutes } from './routes/ai'

const port = process.env.PORT || 3000

// Configure allowed origins for CORS
// Configura origens permitidas para CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'https://gerenciador-financeiro-steel.vercel.app']

const app = new Elysia()
    .use(cors({
        origin: allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }))
    .use(swagger())
    .use(transactionsRoutes)
    .use(aiRoutes)
    .get('/', () => ({ message: 'Finance Manager API is running' }))
    .listen(port)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
