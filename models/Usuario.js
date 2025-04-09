const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema({
  nombre: String,
  apellido: String,
  fechaNacimiento: String,
  usuario: { type: String, unique: true },
  correo: String,
  password: String,
  avatar: {
    type: String,
    default: "img/default-avatar.png"
  },
  amigos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario"
  }],
  solicitudes: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: "Usuario"
}],

module.exports = mongoose.model("Usuario", usuarioSchema, "usuarios");



