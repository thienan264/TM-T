import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import routes from './routes/index.js'
import { ensureDatabaseExists } from './config/ensureDatabase.js'
import { testConnection } from './config/database.js'
import { seedInitialData } from './utils/seed.js'

const app = express()
const PORT = process.env.PORT || 3000

// Body parsers
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Silence favicon 404s (optional)
app.get('/favicon.ico', (req, res) => res.status(204).end())

// Serve static files from /public
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const publicDir = path.resolve(__dirname, '..', 'public')
app.use(express.static(publicDir))

// Friendly routes for auth pages without .html
app.get('/', (req, res) => {
    res.sendFile(path.join(publicDir, 'auth', 'login.html'))
})

app.use('/api', routes)

app.use((req, res) => {
    res.status(404).json({ success: false, message: 'API endpoint không tồn tại' })
})

// Error handler
app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).json({ success: false, message: 'Lỗi server' })
})

async function start() {
    try {
        await ensureDatabaseExists()
        await testConnection()
        await seedInitialData()
    } catch (e) {
        console.warn('[DB] Không thể kết nối DB lúc khởi động. Tiếp tục chạy server...')
    }

    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
}

start()
