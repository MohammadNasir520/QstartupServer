
const express = require("express")
const { ObjectId } = require("mongodb")
const router = express.Router()
const user = require('../models/userModels')

router.get("/admin/getAllStartUp", async (req, res) => {
    try {
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
        if (allUser) {

            res.json(allUser)
        } else {
            res.json('startUp did not found')
        }
    } catch (error) {
        console.log(error)
    }
})
module.exports = router;