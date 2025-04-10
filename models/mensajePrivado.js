const mongoose = require("mongoose");

const mensajePrivadoSchema = new mongoose.Schema({
  emisor: { type: String, required: true },
  receptor: { type: String, required: true },
  contenido: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
  leido: { type: Boolean, default: false } // ✅ nuevo campo
});

module.exports = mongoose.model("MensajePrivado", mensajePrivadoSchema);
