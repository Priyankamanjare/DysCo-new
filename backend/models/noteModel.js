const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const noteSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    content: String,
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });

const Note = mongoose.model("Note", noteSchema);
module.exports = Note;
