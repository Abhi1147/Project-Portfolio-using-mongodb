const express=require("express");
const bodyParser=require("body-parser");
const _=require("lodash");
const mongoose=require("mongoose");
const https=require("https");
const app=express();
const fs=require("fs");
const path=require("path");
const multer=require("multer");
require('dotenv').config();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(bodyParser.json());

require("dotenv").config();



mongoose.connect("mongodb+srv://"+process.env.NAME+":"+process.env.PASSWORD+"@cluster0.fxijpz7.mongodb.net/skillsdb",{useNewUrlParser:true});



const skillSchema=new mongoose.Schema({
    name:String,
    Confidence:Number
});


const imageSchema = new mongoose.Schema({
    name: String,
    projectLink:String,
    img:
    {
        data: Buffer,
        contentType: String
    }
});
const skill=mongoose.model("skill",skillSchema);
const ImgModel=mongoose.model("ImgModel",imageSchema);

var storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'uploads')
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now()+path.extname(file.originalname))
    }
});
var upload=multer({storage:storage});

app.get("/",function(req,res){
    skill.find({}).then(function(elem){
       ImgModel.find({}).then((data,err)=>{
        if(err){
            console.log(err);
        }
        res.render("home",{allSkill:elem,items:data});
       })
    });
});

app.get("/uploadProject",function(req,res){
    res.render("uploadProject");
});

app.post("/uploadProject",upload.single('image'),function(req,res,next){
    var obj={
        name:req.body.projectName,
        projectLink:req.body.link,
        img:{
            data:fs.readFileSync(path.join(__dirname+'/uploads/'+req.file.filename)),
            contentType:'image/png'
        }
    }
    ImgModel.create(obj);
    res.redirect("/");
});

app.get("/addSkill",function(req,res){
    res.render("AddSkill");
});


app.post("/addSkill",function(req,res){
    const addNewSkill=new skill({
        name:req.body.skill,
        Confidence:req.body.progress
    });
    addNewSkill.save();
    res.redirect("/addSkill");
});

app.get("/skill",function(req,res){
    skill.find({}).then(function(elem){
        res.render("skill",{allSkill:elem});
    });
})


app.listen(process.env.PORT || 3000);
