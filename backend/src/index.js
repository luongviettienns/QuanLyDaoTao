import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRouter from './routes/auth.routes.js'
import adminRouter from './routes/admin.routes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Backend is running',
  })
})

app.use('/api/auth', authRouter)
app.use('/api/admin', adminRouter)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
