const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const CommentSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: "User"},
    text: {type: String, required: true, max: 75},
    belongs_to_post: { type: Schema.Types.ObjectId, ref: "Post"},
    time_stamp: { type: Date, default: Date.now },
});

const CommentModel = model('comment', CommentSchema);

module.exports = CommentModel;