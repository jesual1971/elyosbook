const mongoose = require("mongoose");

const mensajePrivadoSchema = new mongoose.Schema({
  emisor: { type: String, required: true },
  receptor: { type: String, required: true },
  contenido: { type: String, required: false }, // 👈 ahora no es obligatorio
  imagen: { type: String }, // 👈 permite subir imagen
  fecha: { type: Date, default: Date.now },
  leido: { type: Boolean, default: false }
});


module.exports = mongoose.model("MensajePrivado", mensajePrivadoSchema);
