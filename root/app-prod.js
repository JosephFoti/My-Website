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
const dotenv = require('dotenv');

// const passport = require('passport');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(express.static('public'));

const result = dotenv.config();

const PORT = process.env.PORT || 3000



const Op = Sequelize.Op

const sequelize = new Sequelize(process.env.DATABASE_URL,  {

	logging: true,
	ssl: true,
	dialect: 'postgres',
	protocol: 'postgres',
	operatorsAliases:{
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

  title: Sequelize.STRING(10000),
  thumbnail: Sequelize.STRING(10000),
  description: Sequelize.STRING(10000),
  content: Sequelize.JSON

});


// User.create({
//
//   username: "AdminJoe",
//   password: "password"
//
// });

sequelize.sync()


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
  filename: (req, file, cb) => {   
    cb(null, Date.now() + (file.originalname));
  }
})


// UPLOAD PROCESS DEFINITION

const upload = multer({
  storage: storage
}).array('images')





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

    return res.render('portfolio', {
      port
    });

  });



})

app.get('/portfolio/web-design/:projectName', (req, res) => {

  let projectName = req.params.projectName;
  let port = {};


  fs.readFile('./public/data/web-design-info.json', "utf-8", (err, data) => {


    port.portData = JSON.parse(data)[projectName];
    port.name = port.portData.title;

    fs.readdir('./public/images/web-design/detail-images', (err, files) => {

      let images = files.filter(x => {
        let reg = new RegExp(x.slice(0, x.length - 5));
        console.log(reg);
        if (reg.test(projectName)) {

          // Maybe add mobile images sorting?

          return x;
        }
      })

      port.originalImage = projectName + '.png';
      port.images = images;

      return res.render('web-design-portfolio', {
        port
      });

    })

    // console.log(port.portData);


  })

});

app.get('/front-end-development', (req, res) => {

  Project.findAll().then(x=>{

    res.render('test',{projects:x});

  })

})

app.get('/admin', (req, res) => {

  res.render('login');

});

app.post('/login', passport.authenticate('local', {
  failureRedirect: '/login'
}), (req, res) => {

  res.redirect('/admin-dashboard')

})

app.get('/admin-dashboard', (req, res) => {

  let projects = [];

  // get all current projects for editing and deletion controll on dashboard
  Project.findAll().then(project => {

    for (let item of project) {

      let breif = {};
      breif.title = item.dataValues.title;
      breif.thumb = item.dataValues.thumbnail;
      breif.id = item.dataValues.id;
      projects.push(breif);

    }
    console.log(projects);
    res.render('dashboard', {
      projects
    });

  });


});

app.post('/add', (req, res) => {

  upload(req, res, (err) => {


    let order = req.body.order.split(',');
    let imageFiles = req.files;
    let additionalText = req.body.additionalText;

    let orderedElements = [];

    let thumbnail = imageFiles[0].path.split('/');
    thumbnail.shift();
    thumbnail = thumbnail.join('/');
    imageFiles.shift();

    let desc = req.body.text;

    // Additional text / image parser
    // takes the order input which contains demarcations for the order of text vs.
    // image fields and allows for flexibility in building posts.
    for (var i = 0; i < order.length; i++) {
      let html;
      if (order[i] === 'img') {
        let relativePath = imageFiles[0].path.split('/');
        relativePath.shift();
        relativePath = relativePath.join('/');

        html = `<img src="${relativePath}" class="dev-image" />`
        if (typeof imageFiles == "object") imageFiles.shift();

      } else if (order[i] === 'text') {

        if (typeof additionalText == "object") {
          console.log(additionalText[0]);
          html = `<p class="dev-text">${additionalText[0]}</p>`
          additionalText.shift();
          console.log(additionalText);
        } else {
          html = `<p class="dev-text">${additionalText}</p>`
        }

      }
      if (html) {
        orderedElements.push(html);
      }

    }

    Project.create({

      title: req.body.title,
      thumbnail: thumbnail,
      description: desc,
      content: orderedElements

    }).then(project => {
      console.log(project);
      res.redirect('/admin-dashboard');
    });


    Project.insert({

      title: thisProject.title,
      thumbnail: thisProject.thumbnail,
      content: thisProject.content

    }).then(x=>{
      console.log(x);
      res.render('front-end-blog', {
        orderedElements
      });
    })



  });


})

app.post('/remove', (req, res) => {

  Project.destroy({
    where: {
      id: parseInt(req.body.id)
    }
  }).then( ()=>{
    res.redirect('/admin-dashboard');
  });

})








app.listen(PORT, function() {
  console.log('joe!');
})
