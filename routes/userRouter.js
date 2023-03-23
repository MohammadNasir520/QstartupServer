const express = require("express")
const { ObjectId } = require("mongodb")
const { signUp, login, getAllUser } = require("../controllers/userController")
const router = express.Router()
const user = require('../models/userModels')


// Sign Up
router.post('/signup', signUp)


// login
router.post('/login', login)

// get all user 
router.get('/user', getAllUser)

// save social medea link
router.put('/socialMedia', async (req, res) => {
    const socialMedalLink = req.body;
    const id = req.query.id;

    console.log(socialMedalLink, id)
    try {

        const updated = await user.findOneAndUpdate(
            { _id: new ObjectId(id) },

            {
                $set: {
                    // id: id,
                    // email: email,
                    // role: role,
                    // username: username,
                    // data: req.body
                    socialMedalLink: req.body
                }
            },
            { upsert: true }
        );
        res.send(updated);


    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
    console.log(socialMedalLink)



})

module.exports = router