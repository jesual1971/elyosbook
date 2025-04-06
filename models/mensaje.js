const mongoose = require("mongoose");

const mensajeSchema = new mongoose.Schema({
  autor: String,
  contenido: String,
  fecha: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("MensajeGeneral", mensajeSchema);
