const express = require('express')
const app = express()
const cors = require("cors")
const mongoose = require('mongoose')
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken')
require("dotenv").config()

mongoose.set('strictQuery', true);


const user = require('./models/userModels')
// const checkAuth = require('./db/middleware/CheckAuth')
const userRouter = require("./routes/userRouter")
const careerRouter = require("./routes/careerRouter")
const nodemailer = require("nodemailer")

// ejs setup
const ejs = require('ejs');
app.set('view engine', 'ejs');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());
app.use(express.json())

app.use(userRouter)
app.use(careerRouter)

// database connection
const database = module.exports = () => {
    const connectionParams = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }


    try {
        mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.c5dej4c.mongodb.net/duckcart?retryWrites=true&w=majority`, connectionParams)
        // mongoose.connect(`mongodb://localhost:27017/duckcart`, connectionParams)

        console.log('database connected successfully')

    } catch (error) {
        console.log(error)
    }
}
database()

app.put('/mentor', async (req, res) => {
    const email = req.body.email;
    const role = req.body.role;
    const username = req.body.username;
    console.log(req.body)
    console.log(role)

    try {

        await user.findOneAndUpdate(
            { email },

            {
                $set: {
                    role: role,
                    username: username,
                    data: req.body
                }
            },
            { upsert: true }
        );
        res.json('updated');


    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

const sendEMail = async (email, token) => {
    console.log(email)
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.Email, // generated ethereal user
            pass: process.env.GmailAppPassword, // generated ethereal password
        },
    });

    const mailOptions = ({
        from: process.env.Email,
        to: email,
        subject: "reset your Password",

        html: `<a href="http://localhost:5000/resetPasswordForm?token=${token}">click here </a> <p> to reset your password </p>`, // html body
    });
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error)
        } else {
            console.log('Email sent: ' + info.response);
        }
    })

}


app.post('/resetPassword', async (req, res) => {

    const email = req.body.email;
    const userData = await user.findOne({ email: email })
    const password = userData?.password

    if (!userData) {
        return res.status(400).send('user not found')

    }
    else {
        const token = jwt.sign({ password }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })
        const updatedUser = await user.updateOne({ email: email }, { $set: { token: token } })

        sendEMail(userData.email, token)
        res.send({ message: "please check your Email and reset your password" })

    }

})

app.post('/resetPasswordFinal', async (req, res) => {
    const token = req.query.token;
    const password = req.body.password
    if (!password) {
        console.log('password not get')
    }
    console.log('password', password)
    console.log('token', token)
    const UserData = await user.findOne({ token: token });
    if (!UserData) {
        res.status(400).send('invalid token')
    } else if (UserData) {
        const updatedUserData = await user.findOneAndUpdate({ email: UserData.email }, { $set: { password: password, token: "" } }, { new: true })
        // res.send(updatedUserData)
        if (updatedUserData) {
            res.send("password reset successfully")
        }
    }
    console.log(token)
})
app.get('/resetPasswordForm', async (req, res) => {
    const token = req.query.token;
    const password = req.body.password
    const UserData = await user.findOne({ token: token });
    if (!UserData) {
        res.status(400).send('invalid token')
    } else if (UserData) {

        // res.send(updatedUserData)
        res.render('resetPasswordForm', { token })
    }

})







app.get('/', (req, res) => {
    res.send('api running')
})


app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})