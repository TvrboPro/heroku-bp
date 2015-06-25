var mongoose = require('mongoose'),
   Schema = mongoose.Schema,
   ObjectId = Schema.ObjectId;

var tweetsSchema = new Schema({
    id: String,
    screen_name: String,
    user_name: String,
    text: String,
    date: Date
}, {
    collection: 'tweets'
});

module.exports = mongoose.model('Tweets', tweetsSchema);
