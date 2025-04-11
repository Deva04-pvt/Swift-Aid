import mongoose from 'mongoose';

const woundHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserCredentials',
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  publicUrl: {
    type: String,
    required: true,
  },
  cloudinaryPublicId: {
    type: String,
    required: true,
  },
  prediction: {
    type: String,
    enum: [
      "Abrasions",
      "Bruises",
      "Burns",
      "Cut",
      "Ingrown nails",
      "Laceration",
      "Stab wound",
    ],
    required: true,
  },
  confidence: {
    type: Number,
    required: true,
  },
  width: {
    type: Number,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
  format: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const WoundHistory = mongoose.models.WoundHistory || mongoose.model('WoundHistory', woundHistorySchema);
export default WoundHistory;