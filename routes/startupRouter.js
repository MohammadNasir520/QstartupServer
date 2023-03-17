const mongoose = require("mongoose")
const router = mongoose.Router()

router.get("/startUp/getAllStartUp", async (req, res) => {
    console.log('startUp route hit')
    res.json('startup route hit')
})