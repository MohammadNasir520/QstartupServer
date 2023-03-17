const express = require("express")
const router = express.Router()

router.get("/admin/getAllStartUp", async (req, res) => {
    console.log('startUp route hit')
    res.json('startup route hit')
})
module.exports = router;