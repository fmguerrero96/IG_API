const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const PostSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: "User"},
    caption: {type: String, required: true, max: 150},
    time_stamp: { type: Date, default: Date.now },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    likes_count: {type: Number, default: 0 },
    picture: {type: String},
});

const PostModel = model('Post', PostSchema);

module.exports = PostModel;