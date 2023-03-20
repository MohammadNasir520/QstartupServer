const express = require("express")
const { signUp, login, getAllUser } = require("../controllers/userController")
const router = express.Router()



// Sign Up
router.post('/signup', signUp)


// login
router.post('/login', login)

// get all user 
router.get('/user', getAllUser)

module.exports = router