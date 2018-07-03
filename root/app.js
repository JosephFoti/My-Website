const ejs = require('ejs')
const http = require('http');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize')
// const passport = require('passport');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static('public'));


const Op = Sequelize.Op
// const sequelize = new Sequelize('barkspace', postgres_user, postgres_pass, {
const sequelize = new Sequelize('fauxbase', 'postgres', 'Giraffes94', {

  // host: 'localhost',
  // port: '5432',
  dialect: 'postgres',
  operatorsAliases: {
    $and: Op.and,
    $or: Op.or,
    $eq: Op.eq,
    $regexp: Op.regexp,
    $iRegexp: Op.iRegexp,
    $like: Op.like,
    $iLike: Op.iLike
  }
})


//____________________________________CREATE A TABLE

const User = sequelize.define('user', {

  username: Sequelize.STRING,
  password: Sequelize.STRING

});

const Project = sequelize.define('project', {

  title: Sequelize.STRING,
  thumbnail: Sequelize.STRING,
  content: Sequelize.JSON

});

sequelize.sync()

User.create({

  username: "AdminJoe",
  password: "password"

});










app.get('/', (req, res) => {

  res.render('home');

});

app.get('/portfolio/:type', (req, res) => {

  let type = req.params.type;
  let name = type.split('-').join(' ');
  let port = {};

  port.name = name
  port.call = type;



  fs.readdir(`./public/images/${type}`, (err, files) => {

    console.log(files);
    port.collection = files;

    // Web design needs links to pages with more images for the project +
    // descriptions

    if (type === 'web-design') {
      port.details = true;
    }

    return res.render('portfolio', { port });

  });



})

app.get('/portfolio/web-design/:projectName', (req,res)=>{

  let projectName = req.params.projectName;
  let port = {};


  fs.readFile('./public/data/web-design-info.json', "utf-8", (err,data)=>{


    port.portData = JSON.parse(data)[projectName];
    port.name = port.portData.title;

    fs.readdir('./public/images/web-design/detail-images', (err,files)=>{

      let images = files.filter(x=>{
        let reg = new RegExp(x.slice(0,x.length-5));
        console.log(reg);
        if ( reg.test(projectName) ) {

          // Maybe add mobile images sorting?

          return x;
        }
      })

      port.originalImage = projectName+'.png';
      port.images = images;

      return res.render('web-design-portfolio', {port});

    })

    // console.log(port.portData);


  })

});

app.get('/admin', (req,res)=>{

  res.render('login');

})

app.get('/front-end-development',(req,res)=>{



})




app.listen(8080, function() {
  console.log('joe!');
})
