const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cardSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { timestamps: true });

const Card = mongoose.model("Card", cardSchema);
module.exports = Card;
