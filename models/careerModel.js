const mongoose = require("mongoose")


const careerSchema = new mongoose.Schema({
    applicationFor: {
        type: String
    },
    citizenship: {
        type: String
    },
    DateOfBirth: {
        type: String
    },
    address: {
        type: String
    },
    zipCode: {
        type: String
    },
    city: {
        type: String
    },
    phone: {
        type: String
    },
    email: {
        type: String
    },
    resume: {
        type: String
    },
    cv: {
        type: String
    },
    date: {
        type: String
    },
    name: {
        type: String
    }

})
module.exports = mongoose.model("career", careerSchema)