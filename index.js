const express = require('express')
const app = express()
const cors = require("cors")
const mongoose = require('mongoose')
const { ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken')
const nodemailer = require("nodemailer")
const fs = require('fs')
const multer = require("multer");
const path = require("path");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
app.use(cookieParser())


require("dotenv").config()
mongoose.set('strictQuery', true);

// require routers and models
const user = require('./models/userModels')
const userRouter = require("./routes/userRouter")
const careerRouter = require("./routes/careerRouter")
const startUpRouter = require("./routes/startupRouter")
const career = require("./models/careerModel")
const message = require('./models/messageModel')

// ejs setup
const ejs = require('ejs');
const { findOne } = require('./models/userModels');
app.set('view engine', 'ejs');



// middleware 
app.use(cors());
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



// app.use(express.static('uploads'));


// router middle ware
app.use(userRouter)
app.use(careerRouter)
app.use(startUpRouter)

// const corsOptions = {
//     origin: 'http://127.0.0.1:5502',
//     credentials: true
// };


// https://deft-custard-35113f.netlify.app/

// cors bolck handle
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://deft-custard-35113f.netlify.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});



// database connection
const database = module.exports = () => {
    const connectionParams = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }


    try {
        mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.c5dej4c.mongodb.net/duckcart?retryWrites=true&w=majority`, connectionParams)

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
    let data = req.body;
    if (req.body.email_StartUp) {

        email = req.body.email_StartUp;
    }
    else if (req.body.email_Mentor) {

        email = req.body.email_Mentor;
        data = { ...req.body, "status": 'active' }

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
                    data: data

                }
            },
            { upsert: true, new: true }
        );
        if (!registered) {
            res.json({ message: 'something going wrong please try again' });
        } else if (registered) {

            const subject = "Welcome to Q Startups!"
            const from = process.env.Email

            const html = `
            <p style="width: 400px">

            Dear ${req.body.username || req.body.startupName}, <br>

We are excited to welcome you to Q Startups! Thank you for joining our community of entrepreneurs and innovators.
<br>

As a Q Startups member, you will have access to a variety of resources, including mentorship, networking opportunities, and funding support. These resources are designed to help you succeed in your entrepreneurial journey and achieve your goals.

<br>
To log in to your Q Startups account, please visit our website at www.qstartups.com and use the following credentials:
<br>

Username: ${email} <br>
Password: ${ExistingUser.password}<br>
UniqueId: ${id}
<br>

Please take a moment to verify that your account details are correct and let us know if you have any difficulty logging in.
<br>
If you have any questions or concerns, please do not hesitate to contact us at consult.pragya@gmail.com. We are here to help you every step of the way and ensure your success.
<br>
Thank you for choosing Q Startups! We look forward to working with you and supporting your entrepreneurial endeavors.
<br>
Best regards, 

<br>

Q Startups

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

    res.status(200).send({ success: true, message: 'Email sent successfully' })
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
            const { FirstName, FamilyName, email } = req.body

            const findExistingApply = await career.find({ email: email })
            if (findExistingApply.length > 0) {
                console.log('finded', findExistingApply)
                return res.send({
                    success: false,

                    message: ' You have  already applied ',
                    // data: deleteResume_cv
                })
            }

            const name = FirstName + '_' + FamilyName

            const now = new Date();
            const day = now.getDate();
            const month = now.getMonth() + 1; // add 1 because January is 0
            const year = now.getFullYear();
            console.log(`Today's date is ${day}/${month}/${year}`);
            const date = `${day}/${month}/${year}`

            console.log('date', date)
            const resume = req.files?.resume[0].destination + req.files?.resume[0].filename
            const cv = req.files?.cv[0].destination + req.files?.cv[0].filename


            const careerData = new career({ name, ...req.body, resume, cv, date })
            const dataSaved = await careerData.save()
            // res.json(dataSaved)
            if (dataSaved) {
                return res.send({
                    success: true,

                    message: ' Your apply is successful',
                    // data: deleteResume_cv
                })
            }
            console.log(dataSaved)
            console.log(req.files)
            console.log('resume', req.files?.resume[0].filename)
            console.log("cv", req.files?.cv[0].filename)
            console.log(req.body)

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

    console.log(req.query.path)

    const filePath = req.query.path;
    res.download(filePath);
    res.cookie('myCookie', 'hello');

})



app.delete('/api/deletePdf', async (req, res) => {
    console.log('file delete hit')
    const resumePath = req.query.path;
    console.log('path', resumePath)
    console.log(req.query.for)
    try {



        if (req.query.for == 'applicant') {


            if (!fs.existsSync(resumePath)) {
                return res.status(404).json("File not found.");
            }
            fs.unlink(resumePath, async (error) => {
                if (error) {
                    console.log(error)
                    return res.status(500).json('Error deleting file');

                }



                const deletePdfData = await user.updateOne(

                    { 'data.businessDocument': { $elemMatch: { path: resumePath } } },
                    { $pull: { 'data.businessDocument': { path: resumePath } } },

                )


                if (deletePdfData.nModified === 0) {
                    console.log(`Failed to delete document with path: ${resumePath}`);
                    res.status(404).json(`Failed to delete document with path: ${resumePath}`);
                } else {
                    console.log(`${resumePath} deleted successfully`);
                    // res.json(`${resumePath} deleted successfully`);
                }
            });



            let deleteResume_cv;
            const matchingDoc = await career.findOne({ $or: [{ cv: resumePath }, { resume: resumePath }] });

            const matchingResume = await career.findOne({ resume: resumePath });
            const matchingCv = await career.findOne({ cv: resumePath });
            if (matchingResume) {
                if (matchingResume && matchingDoc.cv) {
                    deleteResume_cv = await career.updateOne(
                        { resume: resumePath },
                        { $unset: { resume: 1 } },
                        { new: true }
                    )
                    if (deleteResume_cv) {
                        return res.status(200).send({
                            success: true,
                            resumeDeleted: true,
                            message: 'resume deleted ',
                            data: deleteResume_cv
                        })
                    }

                } else if (matchingResume && !matchingDoc.cv) {
                    const deletedDoc = await career.deleteOne({ $or: [{ cv: resumePath }, { resume: resumePath }] });
                    console.log(deletedDoc)
                    return res.status(200).json({
                        success: true,
                        DocDelete: true,
                        message: 'resume and cv deleted',
                        data: deleteResume_cv
                    })
                }
            } else {
                if (matchingCv && matchingDoc.resume) {
                    deleteResume_cv = await career.updateOne(
                        { cv: resumePath },
                        { $unset: { cv: 1 } },
                        { new: true }
                    );

                } else if (matchingCv && !matchingDoc.resume) {
                    const DeletedDoc = await career.deleteOne({ $or: [{ cv: resumePath }, { resume: resumePath }] });
                    console.log(DeletedDoc)

                    return res.status(200).send({
                        success: true,
                        DocDelete: true,
                        message: 'resume and cv deleted',
                        data: deleteResume_cv
                    })
                }

            }




            if (deleteResume_cv) {
                console.log('for hit in status')
                res.status(200).send({
                    success: true,
                    message: 'resume or cv deleted last',
                    data: deleteResume_cv
                })
            }
            console.log(deleteResume_cv)
        }


        if (req.query.for == 'businessDocument') {
            if (!fs.existsSync(resumePath)) {
                return res.status(200).send({
                    success: false,

                    message: 'file not found',

                })
            }
            fs.unlink(resumePath, async (error) => {
                if (error) {
                    console.log(error)
                    return res.status(500).json('Error deleting file');

                }



                const deletePdfData = await user.updateOne(

                    { 'data.businessDocument': { $elemMatch: { path: resumePath } } },
                    { $pull: { 'data.businessDocument': { path: resumePath } } },

                )


                if (deletePdfData.nModified === 0) {
                    console.log(`Failed to delete document with path: ${resumePath}`);
                    res.status(404).json(`Failed to delete document with path: ${resumePath}`);
                } else {
                    console.log(`${resumePath} deleted successfully`);

                    return res.status(200).send({
                        success: true,

                        message: 'Document  deleted',

                    })
                }


            });

        }




    } catch (error) {
        console.log(error);
        res.status(500).json('Error deleting file');
    }
});




// get all Applicants
app.get('/api/applicants', async (req, res) => {
    const allAplicants = await career.find()
    res.json(allAplicants)
})


// subscribe 
app.put('/api/subscribe', async (req, res) => {
    const email = req.body.email;
    const findedUser = await user.findOne({ email: email })
    console.log(findedUser)

    try {

        if (findedUser?.subscribe == true) {
            return res.status(400).send({
                success: false,
                message: ' already subscribed',

            })
        }

        if (findedUser && findedUser !== null) {
            console.log(' found')

            let subscribeUpdaed = await user.findOneAndUpdate(
                {
                    email: email
                },
                {

                    $set: {
                        subscribe: true,

                    }
                },
                {
                    upsert: true,
                    new: true
                }
            )

            if (subscribeUpdaed) {
                res.status(200).send({
                    success: true,
                    message: 'subscription successful',
                    data: subscribeUpdaed
                })
            }
        }

        else if (!findedUser) {
            console.log('not found')
            let newUser = new user(
                {
                    email: email,
                    subscribe: true,
                    role: 'preUser'
                }
            )
            let saved = await newUser.save()
            res.status(200).send({
                success: true,
                message: 'subscription successful',
                data: saved
            })


        }



    } catch (error) {
        console.log(error)

    }
})

app.put('/api/sendMessage', async (req, res) => {
    console.log('hit messege')
    console.log(req.body)
    const sender = await user.findOne({ id: req.body.senderId })
    const receiver = await user.findOne({ id: req.body.uniqueId })


    const senderInfromationAndMessage = {
        senderId: req.body.senderId,
        senderImage: sender.data.imageurl,
        message: req.body.message,
        name: sender.username,

    }


    if (!sender || sender === null || undefined) {
        return res.status(401).send({
            success: false,
            message: 'Unauthorized access',

        })
    }

    if (!receiver || receiver === null || undefined) {

        return res.status(400).send({
            success: false,
            message: 'invalid id',

        })


    }


    const existingMessage = await message.findOne({ receiverId: req.body.uniqueId })
    if (existingMessage !== null && existingMessage.receiverId) {

        const updatedMessage = await message.findOneAndUpdate(
            { receiverId: req.body.uniqueId },
            { $push: { 'message': senderInfromationAndMessage } },
            { upsert: true, new: true }
        )
        if (updatedMessage) {
            res.status(200).send({
                success: true,
                message: 'message sent succussfully 2',

            })
        }
        return console.log('not found', existingMessage)



    } else {
        console.log('create ')
        const newMessage = new message(
            {
                receiverId: req.body.uniqueId,
                message: [senderInfromationAndMessage]
            }
        )
        const savedMessage = await newMessage.save()
        if (savedMessage) {
            res.status(200).send({
                success: true,
                message: 'message sent succussfully ',

            })
        }

    }



})


// load message

app.get('/api/getMessage', async (req, res) => {
    console.log('id', req.query.uniqueId)
    const messages = await message.findOne({ receiverId: req.query.uniqueId })
    if (messages) {
        res.status(200).send({
            success: true,
            data: messages,

        })
    }
    console.log(messages)
})

app.put('/api/updateMentorStatus', async (req, res) => {
    console.log('mentor status cliked', req.body)
    const userFind = await user.find({ id: req.body.id })
    console.log(userFind)


    const updateMentorStatus = await user.findOneAndUpdate(
        { id: req.body.id },
        { $set: { 'data.status': req.body.status } },
        { upsert: true, new: true }


    )
    console.log(updateMentorStatus)
})

app.get('/', (req, res) => {

    res.cookie('token', 'token', {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        secure: false,
        sameSite: 'none',
    });
    res.send('QstartUp api running')
})


app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})