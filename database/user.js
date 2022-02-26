import mongoose from 'mongoose'

/* PetSchema will correspond to a collection in your MongoDB database. */
const PetSchema = new mongoose.Schema(
  {
    id: String,
    kind: String,
    category: String,
    keywords: String,
    isGenerating: Boolean,
  },
  {
    collection: 'User',
  }
)

export default mongoose.models.User || mongoose.model('User', PetSchema)
