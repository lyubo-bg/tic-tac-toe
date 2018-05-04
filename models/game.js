var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GameSchema = new Schema({
    board: {
        type: Array,
        default: [],
        required: true
    },
    next:{
        type: String,
        required: true
    },
    player:{
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Game', GameSchema);