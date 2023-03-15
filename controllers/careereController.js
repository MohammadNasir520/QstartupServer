const careerDataModel = require('../models/careerModel')

exports.saveCareerData = async (req, res) => {

    const careerData = req.body;
    try {
        careerDataModel.create(careerData)
    } catch (err) {
        console.log(err)
    }
    console.log(careerData)
    res.send(careerData)
}