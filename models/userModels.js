const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true,

    },
    password: {
        type: String,


    },
    data: {
        type: Object,

    },
    role: {
        type: String
    }

})
module.exports = mongoose.model('users', userSchema)