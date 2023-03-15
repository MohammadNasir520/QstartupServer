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


// user save by put method
// app.put('/user/:email', async (req, res) => {
//     const email = req.params.email;

//     const user = req.body;
//     const filter = { email: email }
//     const options = { upsert: true }
//     const updateDoc = {
//         $set: user
//     }
//     const result = await usersCollection.updateOne(filter, updateDoc, options)

//     res.send({ result, token })
// })





app.get('/', (req, res) => {
    res.send('api running')
})


app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})