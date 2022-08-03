const express = require("express")
const multer = require("multer")
const mongoose = require("mongoose")
const app = express()
const route = require("./routes/routes")
const bodyParser=require("body-parser")

app.use(multer().any(),(err, req, res, next) => {res.status(400).send({status:false,message: err.message,});
  })
app.use(bodyParser.json())


mongoose.connect("mongodb+srv://suman:Mdhang%40123@atlascluster.tlenk.mongodb.net/group74Database"
    , { useNewUrlParser: true })
    .then(() => console.log("MongoDb is connected"))
    .catch(err => console.log(err))

app.use("/", route)
app.use((req,res,next)=>{
    res.status(404).send({status:404, msg:`Not found ${req.url}`})
    next()
})



app.listen(process.env.PORT || 3000, function () { console.log("Express is running on port " + (process.env.PORT || 3000)) });
