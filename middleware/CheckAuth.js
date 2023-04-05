const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const AuthHeader = req.headers.authorization

        if (!AuthHeader) {
            return res.status(401).send({ message: 'unAuthorized access' })
        }

        const token = AuthHeader.split(" ")[1]
        console.log(token)

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (error, decoded) {
            if (error) {
                return res.status(401).send({ message: "unauthorized access" })
            }
            req.decoded = decoded
            next()
        })

    }
    catch (error) {
        res.send(error)
    }
}