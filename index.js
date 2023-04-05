const express = require('express')
const app = express()
const cors = require("cors")
const mongoose = require('mongoose')
const { ObjectId } = require('mongodb');
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












// middleware 
app.use(cors());
app.use(express.json())

app.use(userRouter)
app.use(careerRouter)
app.use(startUpRouter)



const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));


const multer = require("multer");
const path = require("path");



app.use(bodyParser.json());
const corsOptions = {
    origin: 'http://127.0.0.1:5500',
    credentials: true
};

app.use(cors(corsOptions));


require("dotenv").config()

app.use(cors()); // enable CORS for all origins
app.use(bodyParser.json()); // handle JSON payloads
app.use(express.json())



// database connection
const database = module.exports = () => {
    const connectionParams = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }


    try {
        mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.c5dej4c.mongodb.net/duckcart?retryWrites=true&w=majority`, connectionParams)
        // mongoose.connect(`mongodb://localhost:27017/Qstartup`)
        // mongoose.connect(`mongodb://localhost:27017/duckcart`, connectionParams)

        console.log('database connected successfully')

    } catch (error) {
        console.log(error)
    }
}
database()



//  send mail function
const sendEMail = async (fromEmail, toEmail, subject, html) => {

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.Email,
            pass: process.env.GmailAppPassword,
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


// puting the data of mentor and startup
app.put('/registration', async (req, res) => {

    let email = '';
    if (req.body.email_StartUp) {

        email = req.body.email_StartUp;
    }
    else if (req.body.email_Mentor) {

        email = req.body.email_Mentor;
    }
    const role = req.body.role;
    const username = req.body.username;
    const ExistingUser = await user.findOne({ email: email })
    console.log('existingUser', ExistingUser)
    let id = ''

    if (req.body.email_StartUp) {

        id = 'S' + ExistingUser._id;
    }
    else if (req.body.email_Mentor) {

        id = 'M' + ExistingUser._id;
    }
    console.log(req.body)
    console.log(role)

    try {

        registered = await user.findOneAndUpdate(
            { email },

            {
                $set: {
                    id: id,
                    email: email,
                    role: role,
                    username: username,
                    data: req.body
                }
            },
            { upsert: true, new: true }
        );
        if (!registered) {
            res.json({ message: 'something going wrong please try again' });
        } else if (registered) {

            const subject = "Registration successful"
            const from = process.env.Email

            const html = `
            <a>Congratulaton for successfully registration <br>
            at QStartUp as ${req.body.email_StartUp ? "startUp" : "mentor"} <br>
            Your unique Id: ${id} <br>
            please keep the Unique ID 
            </p> `

            const emailSend = await sendEMail(from, registered.email, subject, html)
            res.status(200).json({ status: 200, data: registered, message: 'registration successful , Check Your Email and collect Unique ID', emailSend });


        }


    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

// edit user for admin 
// puting the data of mentor and startup
app.put('/EditUser', async (req, res) => {

    let id = req.query.id;
    console.log(id)
    let email = '';
    if (req.body.email_StartUp) {

        email = req.body.email_StartUp;
    }
    else if (req.body.email_Mentor) {

        email = req.body.email_Mentor;
    }
    const role = req.body.role;
    const username = req.body.username;
    const ExistingUser = await user.findOne({ id: id })

    const updatedUser = await Object.assign({}, ExistingUser?.data, req.body);

    console.log('existing User', ExistingUser)
    console.log({ 'updateUser': updatedUser })
    console.log('current user', req.body)

    try {

        registered = await user.findOneAndUpdate(
            { id: id },

            {
                $set: {
                    id: id,
                    email: email,
                    role: role,
                    username: username,
                    data: updatedUser
                }
            },
            { upsert: true }
        );
        if (!registered) {
            res.status(404).json({ status: 404, message: 'something going wrong please try again' });
        } else if (registered) {


            res.status(200).json({ status: 200, data: registered, message: 'Edit success full' });


        }


    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});


// send link and add token to the users document 
app.post('/sendResetLinkEmail', async (req, res) => {
    let email = req.body.email;

    // const email = req.body.email;
    console.log('email', email)
    const userData = await user.findOne({ email: email })
    const password = userData?.password

    if (!userData) {
        return res.status(400).json({ message: 'user not found' })
    }
    else {
        const token = jwt.sign({ password }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })
        const updatedUser = await user.updateOne({ email: email }, { $set: { token: token } })

        const subject = "reset your Password"
        const from = process.env.Email
        const html = `<a href="https://qstartupserver.onrender.com/resetPasswordForm?token=${token}">click here </a> <p> to reset your password </p>`

        sendEMail(from, userData.email, subject, html)
        // res.status(200).send({ message: "please check your Email and reset your password" })
        res.status(200).json({ status: 200, message: "please check your Email inbox or spam and reset your password" });


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
            res.render('LoginPageRedirect')
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

app.delete('/userDelete/:id', async (req, res) => {

    const id = req?.params?.id
    console.log(id)
    const deletedUser = await user.findOneAndDelete({ id: id })
    console.log(id)
    res.send(deletedUser)
})



//  file uplod and dwonload


const UPLOADS_FOLDER = "./uploads/";
// configure multer to handle file uploads
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, UPLOADS_FOLDER);
        },
        // filename: function (req, file, callback) {
        //     console.log('file for name', file)
        //     callback(null, file.originalname);
        // }
        filename: (req, file, cb) => {
            const fileExt = path.extname(file.originalname);
            const fileName =
                file.originalname
                    .replace(fileExt, "")
                    .toLowerCase()
                    .split(" ")
                    .join("-") +
                "-" +
                Date.now();

            cb(null, fileName + fileExt);
        },
    })
});





app.post('/application', upload.fields([
    {
        name: "resume",
        maxCount: 1,
    },
    {
        name: "cv",
        maxCount: 1,
    },
]),
    async (req, res) => {
        try {
            console.log('hit')

            res.json("succes")
            console.log(req.files)
            return console.log(req.body)




        } catch (err) {
            console.error(err);
            res.status(500).json('Error uploading PDF');
        }
    });

// default error handler
app.use((err, req, res, next) => {
    if (err) {
        if (err instanceof multer.MulterError) {
            res.status(500).json("There was an upload error!");
        } else {
            res.status(500).json(err.message);
        }
    } else {
        res.json("success");
    }
});




app.get('/downloadPdf', (req, res) => {



    const filePath = './uploads/md.-nasir-uddin-certificate-1680668008323.pdf';
    res.download(filePath);

})










app.get('/', (req, res) => {
    res.send('api running')
})


app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})