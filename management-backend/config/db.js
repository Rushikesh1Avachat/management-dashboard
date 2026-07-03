import dns from 'dns'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

// Use a public DNS resolver for Atlas SRV lookups when the default OS resolver fails.
dns.setServers(['8.8.8.8', '1.1.1.1'])

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/management-dashboard'

async function connectDB() {
  if (!MONGO_URI) {
    throw new Error('MONGO_URI is required to connect to MongoDB.')
  }

  mongoose.set('strictQuery', false)

  await mongoose.connect(MONGO_URI)
  console.log('Connected to MongoDB')
}

export default connectDB
