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


app.get('/',(req,res)=>{

  res.render('home');

});

app.get('/portfolio/:type', (req, res)=>{

  let type = req.params.type;
  let name = type.split('-').join(' ');
  let port = {};
  
  port.name = name
  port.call = type;

  fs.readdir(`./public/images/${type}`, (err, files)=>{

    console.log(files);
    port.collection = files;

    res.render('portfolio', {port});

  });

})


app.listen(8080,function(){
  console.log('joe!');
})
