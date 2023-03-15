const user = require("../models/userModels")
const jwt = require("jsonwebtoken")


exports.signUp = async (req, res) => {
    console.log(req.body)
    const { username, email } = req.body;
    console.log(username, email)

    try {
        // Find the existing document with the given email address
        const existingUser = await user.findOne({ email });

        if (existingUser) {
            // If the document exists, update its fields
            existingUser.username = username;
            await existingUser.save();

            res.json("updated and signUp  successful ");
        } else if (!existingUser) {
            // If the document doesn't exist, create a new one
            await user.create({ username, email });
            res.json('user creation and signup successful')
        }

    } catch (error) {
        console.error(error);
        res.status(500).send("Update failed");
    }
}








exports.login = async (req, res) => {

    let result = await user.findOne({ username: req.body.username })
    if (!result) {
        return res.status(404).send('user does not exist')
    }
    else if (result.password !== req.body.password) {
        return res.status(404).send('password does not matched')
    }
    const token = jwt.sign(
        {
            username: result.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "1h"
        }
    )
    console.log(result)
    result = result.toObject()
    delete result.password
    res.send({ result, token })
}