const express = require("express")
const { ObjectId } = require("mongodb")
const { signUp, login, getAllUser, getUserByIdandRole, socialMediaLink } = require("../controllers/userController")
const router = express.Router()
const user = require('../models/userModels')
const { upload } = require("../utils/fileUploads")
const cookieParser = require('cookie-parser');

router.use(cookieParser());

// Sign Up
router.post('/signup', signUp)


// login
router.post('/login', login)

// get all user 
router.get('/user', getAllUser)
router.get('/SingleUser', getUserByIdandRole)

// save social medea link
router.put('/socialMedia', upload.single('businessFile'), socialMediaLink)

module.exports = router