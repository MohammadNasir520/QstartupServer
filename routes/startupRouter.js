
const express = require("express")
const { ObjectId } = require("mongodb")
const router = express.Router()
const user = require('../models/userModels')

router.get("/admin/getAllStartUp", async (req, res) => {
    try {
        // console.log('startUp route hit')
        // const _id = req?.query?._id;
        const role = req?.query?.role;
        if (!role) {
            return res.json('please send role')
        }
        let query = {
            role: role
        }
        // if (_id && role) {
        //     query = {
        //         role: role,
        //         _id: new ObjectId(_id)
        //     }
        // }
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