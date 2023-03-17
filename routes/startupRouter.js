
const express = require("express")
const { ObjectId } = require("mongodb")
const router = express.Router()
const user = require('../models/userModels')

router.get("/admin/getAllStartUp", async (req, res) => {
    console.log('startUp route hit')
    const startUpId = req.query.startUpId;
    let query = {
        role: 'startUp'
    }
    if (startUpId) {
        query = {
            role: 'startUp',
            _id: new ObjectId(startUpId)
        }
    }
    const allUser = await user.find(query)
    res.json(allUser)
})
module.exports = router;