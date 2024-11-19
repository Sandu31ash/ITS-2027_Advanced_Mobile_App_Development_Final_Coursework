// models/Note.ts
const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true // Add index for better query performance
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        trim: true
    },
    backgroundColor: {
        type: String,
        default: '#ffffff'
    },
    images: [{
        type: String, // Array of Firebase Storage URLs
        required: false
    }],
    reminder: {
        type: Date,
        required: false
    },
    pinned: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Note = mongoose.model("Note", noteSchema);

exports.Note = Note;
