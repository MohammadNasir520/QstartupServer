
const mongoose = require("mongoose")


const messageSchema = new mongoose.Schema({
    receiverId: {
        type: String
    },


    message: {
        type: Array
    },

})
module.exports = mongoose.model("message", messageSchema)