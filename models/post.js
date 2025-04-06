const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  autor: String,
  contenido: String,
  fecha: {
    type: Date,
    default: Date.now
  },
  likes: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Post", postSchema);


