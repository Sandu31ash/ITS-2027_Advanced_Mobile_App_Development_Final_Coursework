
const mongoose = require("mongoose");

const taskListSchema = new mongoose.Schema({
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
    tasks: [{
        id: {
            type: String,
            required: true
        },
        text : {
            type: String,
            required: true
        },
        completed: {
            type: Boolean,
            default: false
        }
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

const TaskList = mongoose.model("TaskList", taskListSchema);

exports.TaskList = TaskList;
