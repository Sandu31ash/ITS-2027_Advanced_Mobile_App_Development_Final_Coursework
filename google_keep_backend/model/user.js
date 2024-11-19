const mongoose = require("mongoose");
const Joi = require('joi');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 25
    },
    email: {
        type: String,
        required: true,
        maxlength: 255,
        unique: true
    },
    image: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 500,
        unique: true
    },
    userId: {
        type: String,
        required: true,

    },

    createdAt: { type: Date, default: Date.now },

});

const User = mongoose.model("User", userSchema);

exports.User = User;

