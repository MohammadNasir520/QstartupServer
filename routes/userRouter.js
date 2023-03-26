const express = require("express")
const { ObjectId } = require("mongodb")
const { signUp, login, getAllUser, getUserByIdandRole } = require("../controllers/userController")
const router = express.Router()
const user = require('../models/userModels')


// Sign Up
router.post('/signup', signUp)


// login
router.post('/login', login)

// get all user 
router.get('/user', getAllUser)
router.get('/SingleUser', getUserByIdandRole)

// save social medea link
router.put('/socialMedia', async (req, res) => {
    const socialMedalLink = req.body;
    console.log(socialMedalLink)
    const id = req.query.id;
    try {
        const userDoc = await user.findById(id);
        if (!userDoc) {
            res.status(404).send({ message: 'User not found' });
            return;
        }


        const updatedData = { ...userDoc.data, ...socialMedalLink };



        console.log(socialMedalLink, id)


        const updated = await user.findOneAndUpdate(
            { _id: new ObjectId(id) },

            {
                $set: {
                    // id: id,
                    // email: email,
                    // role: role,
                    // username: username,
                    // data: req.body
                    data: updatedData
                }
            },
            { upsert: true }
        );
        if (updated) {
            res.send({ message: 'social media link saved successfully', data: updated });
        }


    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
    console.log(socialMedalLink)



})

module.exports = router