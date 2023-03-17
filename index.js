const express = require('express')
const app = express()
const cors = require("cors")
const mongoose = require('mongoose')
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken')
require("dotenv").config()
const nodemailer = require("nodemailer")

mongoose.set('strictQuery', true);


const user = require('./models/userModels')
// const checkAuth = require('./db/middleware/CheckAuth')
const userRouter = require("./routes/userRouter")
const careerRouter = require("./routes/careerRouter")
const startUpRouter = require("./routes/startupRouter")

// ejs setup
const ejs = require('ejs');
app.set('view engine', 'ejs');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

// middleware 
app.use(cors());
app.use(express.json())

app.use(userRouter)
app.use(careerRouter)
app.use(startUpRouter)

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

// puting the data of mentor and startup
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

//  send mail function
const sendEMail = async (fromEmail, toEmail, subject, html) => {

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
        from: fromEmail,
        to: toEmail,
        subject: subject,

        html: html,
    });
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error)
        } else {
            console.log('Email sent: ' + info.response);
        }
    })

}





// send link and add token to the users document 
app.post('/sendResetLinkEmail', async (req, res) => {

    const email = req.body.email;
    const userData = await user.findOne({ email: email })
    const password = userData?.password

    if (!userData) {
        return res.status(400).json('user not found')

    }
    else {
        const token = jwt.sign({ password }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })
        const updatedUser = await user.updateOne({ email: email }, { $set: { token: token } })

        const subject = "reset your Password"
        const from = process.env.Email
        const html = `<a href="http://localhost:5000/resetPasswordForm?token=${token}">click here </a> <p> to reset your password </p>`

        sendEMail(from, userData.email, subject, html)
        res.send({ message: "please check your Email and reset your password" })

    }

})

// rendering the user reset form after clicking the inboxed link
app.get('/resetPasswordForm', async (req, res) => {
    const token = req.query.token;
    const UserData = await user.findOne({ token: token });
    if (!UserData) {
        res.status(400).send('invalid token')
    } else if (UserData) {

        res.render('resetPasswordForm', { token })
    }

})

// finally calling the reset passord set the password and update the token as empty
app.post('/resetPassword', async (req, res) => {
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



app.post('/contact', async (req, res) => {
    console.log(req.body)
    const { email, message, subject } = req.body;

    const toEmail = 'nasirahsan520@gmail.com';
    const html = `<p>${message + email} </p>`
    sendEMail(fromEmail = email, toEmail, subject, html)
})




app.get('/', (req, res) => {
    res.send('api running')
})


app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})