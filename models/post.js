const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const PostSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: "User"},
    caption: {type: String, max: 150},
    time_stamp: { type: Date, default: Date.now },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    likes_count: [{ type: Schema.Types.ObjectId, ref: "User" }],
    picture: {type: String},
});

const PostModel = model('Post', PostSchema);

module.exports = PostModel;