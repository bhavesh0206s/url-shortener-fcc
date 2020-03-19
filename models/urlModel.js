const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let UrlSchema = new Schema({
  url: String,
  hash: String
})

let UrlModel = mongoose.model('UrlModel', UrlSchema)

module.exports = UrlModel;