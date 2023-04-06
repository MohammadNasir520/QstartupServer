//  file uplod and dwonload



const multer = require("multer");
const path = require("path");

const UPLOADS_FOLDER = "./uploads/businessDocument/";
// configure multer to handle file uploads
exports.upload = multer({
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





// app.post('/application', upload.fields([
//     {
//         name: "resume",
//         maxCount: 1,
//     },
//     {
//         name: "cv",
//         maxCount: 1,
//     },
// ]),
//     async (req, res) => {
//         try {
//             console.log('hit')
//             const { FirstName, FamilyName } = req.body
//             const name = FirstName + '_' + FamilyName

//             const now = new Date();
//             const day = now.getDate();
//             const month = now.getMonth() + 1; // add 1 because January is 0
//             const year = now.getFullYear();
//             console.log(`Today's date is ${day}/${month}/${year}`);
//             const date = `${day}/${month}/${year}`

//             console.log('date', date)
//             const resume = req.files?.resume[0].destination + req.files?.resume[0].filename
//             const cv = req.files?.cv[0].destination + req.files?.cv[0].filename

//             const careerData = new career({ name, ...req.body, resume, cv, date })
//             const dataSaved = await careerData.save()
//             res.json(dataSaved)

//             console.log(dataSaved)
//             console.log(req.files)
//             console.log('resume', req.files?.resume[0].filename)
//             console.log("cv", req.files?.cv[0].filename)
//             console.log(req.body)

//         } catch (err) {
//             console.error(err);
//             res.status(500).json('Error uploading PDF');
//         }
//     });

// // default error handler
// app.use((err, req, res, next) => {
//     if (err) {
//         if (err instanceof multer.MulterError) {
//             res.status(500).json("There was an upload error!");
//         } else {
//             res.status(500).json(err.message);
//         }
//     } else {
//         res.json("success");
//     }
// });
