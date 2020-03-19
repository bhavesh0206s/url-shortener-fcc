
var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require("body-parser")
const dns = require('dns');
let UrlModel = require('./models/urlModel')

let monogoUrl = 'mongodb+srv://bhavesh:bhavesh1234@cluster0-awgwv.mongodb.net/test?retryWrites=true&w=majority'
mongoose.connect(monogoUrl, { useNewUrlParser: true, useUnifiedTopology: true });

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


const isValidWebsite = async (url)=>{
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

const savingUrlToDb = (url) =>{
  let url_instance = new UrlModel({url: url, hash: shortUrl(url)})
  url_instance.save((err)=>{
    if(err) return err
    return "saved to db"
  })
}

const checkForDataInDb = (url, res) =>{
  UrlModel.findOne({url: url}, (err, result) => {
    if(err){
      return err
    }
    else{
      if(result === null){
        res.json({original_url: url, shorten_url: shortUrl(url)});
        return savingUrlToDb(url)
      }
      else{
        res.json({found:'already exist', result: [result.hash ,result.url]})
      }
    }
  })
}

app.get('/api/shorturl/:new', (req, res) =>{
  UrlModel.findOne({hash: req.params.new}, (err, result) => {
    if(err){
      return err
    }
    else{
      if(result === null){
        res.json({not_found: req.params.new});
      }
      else{
        res.redirect(`https://${result.url}`)
      }
    }
  })
})


app.post("/api/shorturl/new", async (req, res)=> {
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
      checkForDataInDb(modifiedUrl, res)
    })
    .catch(()=> res.json({error:"invalid URL"}))
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});