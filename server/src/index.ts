/**
 * Finance Manager API - Express Entry Point
 * Ponto de Entrada da API de Gestão Financeira - Express
 */
import 'dotenv/config'
import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './swagger'
import { transactionsRouter } from './routes/transactions'
import { aiRouter } from './routes/ai'

const app = express()
const port = process.env.PORT || 3000

// Configure allowed origins for CORS
// Configura origens permitidas para CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [
        'http://localhost:5173',
        'https://gerenciador-financeiro-steel.vercel.app',
        'https://gerenciador-financeiro-f13j.vercel.app'
    ]

// Security middleware
// Middleware de segurança
app.use(helmet({
    contentSecurityPolicy: false, // Disable for Swagger UI
    crossOriginEmbedderPolicy: false
}))

// Rate limiting to prevent abuse
// Limitação de taxa para prevenir abuso
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
})
app.use(limiter)

// CORS configuration
// Configuração de CORS
app.use(cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (e.g., mobile apps, curl)
        // Permite requisições sem origem (ex: apps mobile, curl)
        if (!origin) return callback(null, true)

        if (allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

// Body parsing middleware
// Middleware de parsing de body
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Swagger documentation
// Documentação Swagger
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Finance Manager API Docs'
}))

// API Routes
// Rotas da API
app.use('/transactions', transactionsRouter)
app.use('/ai', aiRouter)

// Health check endpoint
// Endpoint de verificação de saúde
app.get('/', (_req: Request, res: Response) => {
    res.json({ message: 'Finance Manager API is running' })
})

// Global error handler - Never expose stack traces to users
// Tratamento global de erros - Nunca expor stack traces aos usuários
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled error:', err.message)
    res.status(500).json({ error: 'Internal server error' })
})

// 404 handler
// Tratamento de 404
app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Endpoint not found' })
})

// Start server
// Inicia servidor
app.listen(port, () => {
    console.log(`🚀 Express server running on port ${port}`)
    console.log(`📚 Swagger docs available at http://localhost:${port}/swagger`)
})

export default app
