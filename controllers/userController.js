
const user = require("../models/userModels")
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");



// sign up api by email
exports.signUp = async (req, res) => {
    console.log(req.body)

    // destructuring sign up field
    const { username, email, password, confirmpassword } = req.body;

    // find user from users collection of the database
    const existingUser = await user.findOne({ email: email })
    console.log('existing', existingUser)



    // custom validation




    // if (existingUser !== null || undefined && existingUser.email === email && existingUser.role === 'mentor' || 'startUp' || 'admin' || 'user') {
    //     return res.status(400).send({ message: 'email already exist' })
    // }

    if (existingUser?.role && existingUser.role != 'preUser') {
        return res.status(400).send({ message: 'email already exist' })
    }

    if (email === "" || email === undefined || !email) {
        return res.status(404).send({ message: 'email  should not be empty' })
    }

    if (username === "" || username === undefined || !username) {
        return res.status(404).send({ message: 'username should not be empty' })
    }
    if (password === "" || confirmpassword === "" || !password || !confirmpassword) {
        return res.status(404).send({ message: 'password or confirmpassword should not be empty' })
    }
    else if (password !== confirmpassword) {
        return res.status(404).send({ message: 'password and confirm password did not match' })
    }
    else if (password.length < 6 || confirmpassword.length < 6) {
        return res.status(404).send({ message: 'password must be at least 6 character' })
    }


    // delete confirm password from saving in database
    delete req.body.confirmpassword;


    let result;

    if (existingUser?.email === email && existingUser?.role === 'preUser') {
        let userUpdated = await user.findOneAndUpdate(
            {
                email: email
            },
            {

                $set: {
                    username: username,
                    password: password,
                    role: 'user'
                }
            },
            {
                upsert: true,
                new: true
            }
        )
        result = userUpdated
    } else {
        // creating user and save to database 
        let newUser = new user({ ...req.body, role: 'user' });
        result = await newUser.save()
        console.log(result)
    }



    // saved user transfer to object for sending the response and delete password to send respond for sucurity purpose
    result = result.toObject();
    delete result.password;

    // creating jwt token 
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
    // sending response to client site
    res.send({ ...result, token, message: "signup successful" })


}
// ______________________________________signUp API end_________________________________________________________




// ______________________________________login API start______________________________________________

// log in api controller by email
exports.login = async (req, res) => {

    // destructuring login field value
    const { email, password } = req.body;

    //  custom validation of email
    if (email === "" || email === undefined || !email) {
        return res.status(404).json({ message: 'email  should not be empty' })
    }


    // user find from saved data base
    let result = await user.findOne({ email: email })
    if (!result || !result.password) {
        return res.status(404).json({ message: 'user does not exist' })
    }

    // validation of saved password and users input password
    else if (result.password !== password) {
        return res.status(404).json({ message: 'incorrect password' })
    }


    // jwt token create
    const token = jwt.sign(
        {
            username: result.email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "1h"
        }
    )
    console.log(result)

    // saved user transfer to object for sending the response and delete password, _id to send respond for sucurity purpose
    result = result.toObject()
    delete result.password
    // delete result._id


    res.cookie('tokenL', 'tokenLs', {
        httpOnly: false,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        secure: false,
        sameSite: 'lax',
        domain: 'https://whimsical-wisp-fb32f5.netlify.app/'

    });




    // sending the response
    res.status(200).send({ success: true, message: 'signUp successful', ...result, token })
}
// ______________________________________login API End______________________________________________




//   get all users  or user by id
exports.getAllUser = async (req, res) => {
    const email = req?.query?.email
    const id = req?.query?.id
    console.log('find by email', email)
    console.log("user controller 132", email)
    let query = {}
    if (email) {
        query = {
            email: email
        }
    }
    else if (id) {
        query = {

            // _id: new ObjectId(id)
            id: id
        }
    }

    const users = await user.find(query)

    if (users) {
        console.log(users)

        res.json(users)
    } else {
        res.json({ message: 'user not found' })
    }


}

//   get get users by id and role
exports.getUserByIdandRole = async (req, res) => {

    const id = req?.query?.id
    const role = req.query.role;
    console.log('role', role)

    query = {
        role: role,
        _id: new ObjectId(id)
    }

    const users = await user.find(query)

    if (!users.length == 0) {

        res.json(users)
    } else {
        res.json({ message: 'user not found' })
    }


}

// save social media and busniess document save 

exports.socialMediaLink = async (req, res) => {
    const socialMedalLink = req.body;

    const id = req.query.id;

    console.log('pathe ', req.file?.path)


    let businessDocumentPath;
    if (req.file) {

        businessDocumentPath = req?.file.destination + req?.file.filename
        // businessDocumentPath = req?.file.path
    }



    console.log('path', businessDocumentPath)

    console.log('social', socialMedalLink)
    console.log('bussinesDoucument', req.file)
    try {
        const userDoc = await user.findById(id);
        if (!userDoc) {
            res.status(404).send({ message: 'User not found' });
            return;
        }

        let updatedData;

        if (req.file !== undefined && userDoc.data.businessDocument) {

            updatedData = { ...userDoc.data, ...socialMedalLink, businessDocument: [...userDoc?.data?.businessDocument, { documentName: req.file.filename, path: businessDocumentPath }] };
        }
        else if (req.file == undefined && userDoc.data.businessDocument) {
            updatedData = { ...userDoc.data, ...socialMedalLink, businessDocument: [...userDoc?.data?.businessDocument] };
        }

        else if (req.file) {
            updatedData = { ...userDoc.data, ...socialMedalLink, businessDocument: [{ documentName: req.file.filename, path: businessDocumentPath }] };

        }


        else {
            updatedData = { ...userDoc.data, ...socialMedalLink };
        }




        console.log(socialMedalLink, id)


        const updated = await user.findOneAndUpdate(
            { _id: new ObjectId(id) },

            {
                $set: {

                    data: updatedData,

                }
            },
            { upsert: true, new: true }
        );
        if (updated) {
            res.status(200).json({ status: 200, message: 'social media link saved successfully', data: updated });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
    console.log(socialMedalLink)
}