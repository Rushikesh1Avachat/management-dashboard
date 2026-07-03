import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  department: { type: String, required: true },
  username: { type: String, default: '' },
  phone: { type: String, default: '' },
  website: { type: String, default: '' }
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', userSchema)
export default User
