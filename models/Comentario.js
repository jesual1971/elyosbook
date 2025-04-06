const mongoose = require("mongoose");

const comentarioSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true
  },
  usuario: String,
  contenido: String,
  fecha: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Comentario", comentarioSchema);

