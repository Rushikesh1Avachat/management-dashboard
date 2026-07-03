import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import usersRouter from './routes/users.js'
import connectDB from './config/db.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000   
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true
  })
)
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'Backend server is live.' })
})

app.use('/api/users', usersRouter)

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message)
    process.exit(1)
  })
