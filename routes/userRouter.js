const express = require("express")
const { signUp, login } = require("../controllers/userController")
const router = express.Router()



// Sign Up
router.put('/signup', signUp)


// login
router.post('/login', login)


// // get users
// app.get('/user', async (req, res) => {
//     console.log(req.decoded)
//     const users = await user.find()
//     res.send(users)
// })



module.exports = router