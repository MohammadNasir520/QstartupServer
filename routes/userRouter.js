const express = require("express")
const { signUp, login } = require("../controllers/userController")
const router = express.Router()



// Sign Up
router.post('/signup', signUp)


// login
router.post('/login', login)


module.exports = router