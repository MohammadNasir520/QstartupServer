const express = require("express")
const { saveCareerData } = require("../controllers/careereController")
const router = express.Router()

router.post('/career', saveCareerData)
module.exports = router