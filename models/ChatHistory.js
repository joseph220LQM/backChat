import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: String, // "user" o "assistant"
  content: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatHistorySchema = new mongoose.Schema({
  name: String,
  studentId: String,
  email: { type: String, required: true },
  messages: [messageSchema],
});

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);
export default ChatHistory;

