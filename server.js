
var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require("body-parser")
const dns = require('dns');


var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.DB_URI);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())
/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});


async function isValidWebsite(url){
  return new Promise((resolve, reject)=>{
    dns.lookup(url, (err, address, family) => {
      if(err) reject(false)
      else resolve(true)
    })
  })
}

const shortUrl = (url)=>{
  return Math.floor(Math.random() * Math.floor(url.length));
}

// your first API endpoint... 
app.post("/api/shorturl/new", async function (req, res) {
  const expression = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gi;
  let url = req.body.url
  if(!expression.test(url)){
    res.json({error:"invalid URL"})
  }
  let indexOfSlash = url.indexOf('/')
  let modifiedUrl =  indexOfSlash !== -1 ? url.slice(indexOfSlash+2) : url  
  console.log(modifiedUrl)
  isValidWebsite(modifiedUrl)
    .then(()=>{
      res.json({original_url: url, shorten_url: shortUrl(url)});
    })
    .catch(()=> res.json({error:"invalid URL"}))
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});