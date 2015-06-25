var mongoose = require('mongoose'),
   Schema = mongoose.Schema,
   ObjectId = Schema.ObjectId;

var instagramsSchema = new Schema({
    link: String,
    imageURL: String,
    date: Date
}, {
    collection: 'instagrams'
});

module.exports = mongoose.model('Instagrams', instagramsSchema);
