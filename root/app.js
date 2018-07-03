const ejs = require('ejs')
const http = require('http');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const Sequelize = require('sequelize');
const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const multer = require('multer');

// const passport = require('passport');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
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

// User.create({
//
//   username: "AdminJoe",
//   password: "password"
//
// });



// ----------------------------------------------------------------------------- PASSPORT JS INIT


app.use(cookieParser());
app.use(require('express-session')({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));

passport.use(new Strategy(

  (username, password, cb) => {
    // NOTE User / Password confirmation for passportJS login
    // use squelize search for first data entry with username feild match
    User.findOne({
      where: {
        username: {
          $iLike: `${username}`
        }
      }
    }).then(data => {
      if (!data) {
        return cb(null, false);
      } else if (data.password !== password) {
        return cb(null, false);
      }
      return cb(null, data);
    });
  }

));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, cb) {
  // NOTE?? gets user data from previously defined local strategy, pushes to
  // user parameter. first callback param is error throw?
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {

  User.findById(id).then(data => {
    if (!data) {
      return cb(null, null);
    }
    cb(null, data);
  });

});

// ------------------------------------------------ Multer



// STORAGE OBJECT DEFINITION

const storage = multer.diskStorage({
destination: './public/images/development-portfolio',
filename: (req, file, cb)=>{
   cb(null, Date.now() + (file.originalname) );
}
})


// UPLOAD PROCESS DEFINITION

const upload = multer({storage: storage}).array('images')





// ------------------------------------------------ Routes


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

app.get('/front-end-development',(req,res)=>{



})

app.get('/admin', (req,res)=>{

  res.render('login');

});

app.post('/login', passport.authenticate('local', {failureRedirect: '/login'}), (req,res)=>{

  res.redirect('/admin-dashboard')

})

app.get('/admin-dashboard', (req,res)=>{

  res.render('dashboard');

});

app.post('/add', (req,res)=>{

  upload(req, res, (err)=>{
    let order = req.body.order;
    console.log(req.files);

    let thisProject = {}

    let orderedElements = [];

    for (var i = 0; i < order.length; i++) {
      if ( order[i] === 'img' ) {
        let html = `<img src="${req.files[0].path}" class="dev-image" />`
        req.files.shift();
      } else {
        let html = `<p class="dev-text">${req.body.text[0]}</p>`
      }
    }
    // var x = '<div style="width:50px;height:50px;background-color:red"></div>';
    // var y = '<div style="width:50px;height:50px;background-color:blue"></div>';
    // var z = '<div style="width:50px;height:50px;background-color:green"></div>';

    res.render('test',{orderedElements});

  })




})








app.listen(8080, function() {
  console.log('joe!');
})
