const { OpenAI } = require("openai");
require("dotenv").config();

const Usuario = require("./models/Usuario");
const Post = require("./models/Post");
const Comentario = require("./models/Comentario");
const Mensaje = require("./models/Mensaje");
const MensajePrivado = require("./models/mensajePrivado");
const express = require("express");
const multer = require("multer");
const path = require("path");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = 3001;
const SECRET_KEY = "tu_clave_secreta_super_segura";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 📦 Conexión a MongoDB usando mongoose
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000
})
.then(() => {
  console.log("🟢 Conectado a MongoDB con Mongoose");
})
.catch((err) => {
  console.error("🔴 Error conectando a MongoDB:", err);
});

// 🧩 Modelos
const usuarioSchema = new mongoose.Schema({
  nombre: String,
  apellido: String,
  fechaNacimiento: String,
  usuario: String,
  correo: String,
  password: String
});

const postSchema = new mongoose.Schema({
  autor: String,
  contenido: String,
  fecha: {
    type: Date,
    default: Date.now
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// 📷 Multer para subir imagen
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/img");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, "usuario-ejemplo" + ext);
  },
});
const upload = multer({ storage: storage });

app.post("/perfil/foto", upload.single("foto"), (req, res) => {
  res.status(200).json({ mensaje: "Imagen subida con éxito" });
});

// 🔐 Registro
app.post("/registro", async (req, res) => {
  try {
    const { nombre, apellido, fechaNacimiento, usuario, correo, password } = req.body;

    if (!nombre || !apellido || !fechaNacimiento || !usuario || !correo || !password) {
      return res.status(400).json({ mensaje: "Todos los campos son obligatorios." });
    }

    const usuarioExiste = await Usuario.findOne({ usuario });
    if (usuarioExiste) {
      return res.status(400).json({ mensaje: "El usuario ya existe." });
    }

    const hash = await bcrypt.hash(password, 10);
    const nuevoUsuario = new Usuario({ nombre, apellido, fechaNacimiento, usuario, correo, password: hash });
    await nuevoUsuario.save();

    res.json({ mensaje: "Registro exitoso" });
  } catch (error) {
    console.error("🔴 Error en el registro:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});

// 🔑 Login
app.post("/login", async (req, res) => {
  try {
    console.log("🟡 Intentando login...");
    console.log("📦 Datos recibidos:", req.body);

    const { usuario, password } = req.body;

    if (!usuario || !password) {
      return res.status(400).json({ mensaje: "Todos los campos son obligatorios." });
    }

    const usuarioEncontrado = await Usuario.findOne({ usuario });
    if (!usuarioEncontrado) {
      return res.status(400).json({ mensaje: "Usuario no encontrado." });
    }

    const coincide = await bcrypt.compare(password, usuarioEncontrado.password);
    if (!coincide) {
      return res.status(401).json({ mensaje: "Contraseña incorrecta." });
    }

    const token = jwt.sign({ usuario: usuarioEncontrado.usuario }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ mensaje: "Inicio de sesión exitoso", token });
  } catch (error) {
    console.error("🔴 Error en el login:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});

// 🔮 Oráculo (modo simulado)
app.post("/ia-oraculo", async (req, res) => {
  const { pregunta } = req.body;

  const contexto = `
Eres el Oráculo de Elyos. Solo puedes responder basado en la sabiduría del libro "La Creación: Luz de la Verdad".

❌ PROHIBIDO:
- Mencionar videojuegos (especialmente Aion).
- Mencionar ciencia moderna, Darwin, evolución, biología o Big Bang.
- Hablar desde fuentes externas a este libro.
- Decir “no estoy seguro” o “según algunas fuentes”.

✅ DEBES:
- Enseñar que Elyos es el Dios Infinito y Creador del Todo.
- Responder usando lenguaje simbólico, sagrado y revelador.
- Describir a Elyos como origen absoluto: el Padre, el Todo, la Fuente Primigenia.
- Afirmar que los humanos provienen de una cadena cósmica: Elyos → Hijos Eternos → Hijos Infinitos → humanidad.
- Hablar del Paraíso, los siete universos, y la verdadera Trinidad cósmica.

Ejemplos aceptables:
- “El ser humano es una chispa divina del Padre Elyos, enviada a la materia para despertar su conciencia.”
- “Elyos creó los siete universos desde su emanación infinita, y a través de los Hijos Infinitos, dio forma a todo lo que existe.”

Habla siempre como una entidad sabia, cósmica y amorosa.

Nunca menciones videojuegos, religión organizada, ciencia moderna ni dudas.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: contexto },
        { role: "user", content: pregunta }
      ],
      temperature: 0.85
    });

    const respuesta = completion.choices[0].message.content;
    res.json({ respuesta });
  } catch (error) {
    console.error("❌ Error al contactar con OpenAI:", error);
    res.status(500).json({ respuesta: "Ocurrió un error al contactar con Elyos IA." });
  }
});


// 🧑‍🤝‍🧑 Buscar amigos
app.get("/buscarAmigos", async (req, res) => {
  try {
    const { nombre } = req.query;
    if (!nombre) {
      return res.status(400).json({ mensaje: "Debes escribir un nombre." });
    }

    const regex = new RegExp(nombre, "i");
    const amigos = await Usuario.find({
      $or: [
        { nombre: regex },
        { apellido: regex },
        { usuario: regex },
        { correo: regex }
      ]
    });

    res.json(amigos);
  } catch (error) {
    console.error("🔴 Error buscando amigos:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});

// 🧑 Obtener lista de amigos de un usuario
app.get("/api/usuarios/:usuario/amigos", async (req, res) => {
  try {
    const { usuario } = req.params;

    const usuarioEncontrado = await Usuario.findOne({ usuario }).populate("amigos");

    if (!usuarioEncontrado) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json(usuarioEncontrado.amigos);
  } catch (error) {
    console.error("Error obteniendo amigos:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});

// ➕ Agregar un amigo
app.post("/api/usuarios/:usuario/agregar-amigo", async (req, res) => {
  try {
    const { usuario } = req.params;
    const { amigoId } = req.body;

    const usuarioPrincipal = await Usuario.findOne({ usuario });

    if (!usuarioPrincipal) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    if (usuarioPrincipal.amigos.includes(amigoId)) {
      return res.status(400).json({ mensaje: "Ya es tu amigo" });
    }

    usuarioPrincipal.amigos.push(amigoId);
    await usuarioPrincipal.save();

    res.json({ mensaje: "Amigo agregado con éxito" });
  } catch (error) {
    console.error("Error agregando amigo:", error);
    res.status(500).json({ mensaje: "Error del servidor" });
  }
});

// ❌ Eliminar un amigo
app.post("/api/usuarios/:usuario/eliminar-amigo", async (req, res) => {
  try {
    const { usuario } = req.params;
    const { amigoId } = req.body;

    const usuarioPrincipal = await Usuario.findOne({ usuario });

    if (!usuarioPrincipal) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    usuarioPrincipal.amigos = usuarioPrincipal.amigos.filter(
      (id) => id.toString() !== amigoId
    );
    await usuarioPrincipal.save();

    res.json({ mensaje: "Amigo eliminado con éxito" });
  } catch (error) {
    console.error("Error eliminando amigo:", error);
    res.status(500).json({ mensaje: "Error del servidor" });
  }
});

app.get("/mis-amigos/:usuario", async (req, res) => {
  try {
    const usuario = await Usuario.findOne({ usuario: req.params.usuario }).populate("amigos");
    if (!usuario) return res.status(404).json([]);

    res.json(usuario.amigos);
  } catch (error) {
    console.error("Error obteniendo amigos:", error);
    res.status(500).json({ mensaje: "Error del servidor" });
  }
});

app.post("/mensajes", async (req, res) => {
  try {
    const { de, para, texto } = req.body;
    if (!de || !para || !texto) return res.status(400).json({ mensaje: "Faltan datos" });

    const nuevo = new Mensaje({ de, para, texto });
    await nuevo.save();

    res.json({ mensaje: "Enviado" });
  } catch (error) {
    console.error("Error enviando mensaje:", error);
    res.status(500).json({ mensaje: "Error del servidor" });
  }
});

app.get("/mensajes", async (req, res) => {
  const { de, para } = req.query;
  if (!de || !para) return res.status(400).json([]);

  try {
    const mensajes = await Mensaje.find({
      $or: [
        { de, para },
        { de: para, para: de }
      ]
    }).sort({ fecha: 1 });

    res.json(mensajes);
  } catch (error) {
    console.error("Error obteniendo mensajes:", error);
    res.status(500).json([]);
  }
});

app.get("/api/mensajes", async (req, res) => {
  try {
    const mensajes = await Mensaje.find().sort({ fecha: 1 }); // ordenados por fecha ascendente
    res.json(mensajes);
  } catch (error) {
    console.error("Error al obtener mensajes:", error);
    res.status(500).json({ mensaje: "Error del servidor al obtener mensajes" });
  }
});

// Enviar mensaje privado
app.post("/api/mensajesPrivados", async (req, res) => {
  try {
    const { emisor, receptor, contenido } = req.body;
    const mensaje = new MensajePrivado({ emisor, receptor, contenido });
    await mensaje.save();
    res.status(201).json({ mensaje: "Mensaje enviado" });
  } catch (error) {
    console.error("❌ Error al enviar mensaje privado:", error);
    res.status(500).json({ mensaje: "Error al enviar el mensaje" });
  }
});

// Obtener mensajes entre dos usuarios
app.get("/api/mensajesPrivados", async (req, res) => {
  try {
    const { emisor, receptor } = req.query;
    const mensajes = await MensajePrivado.find({
      $or: [
        { emisor, receptor },
        { emisor: receptor, receptor: emisor }
      ]
    }).sort({ fecha: 1 });
    res.json(mensajes);
  } catch (error) {
    console.error("❌ Error al obtener mensajes privados:", error);
    res.status(500).json({ mensaje: "Error al obtener mensajes" });
  }
});

// 📢 Guardar publicación
app.post("/api/comunidad", async (req, res) => {
  try {
    const { autor, contenido } = req.body;

    if (!autor || !contenido) {
      return res.status(400).json({ mensaje: "Faltan datos obligatorios." });
    }

    const nuevoPost = new Post({ autor, contenido });
    await nuevoPost.save();
    res.status(201).json({ mensaje: "Publicado con éxito" });
  } catch (error) {
    console.error("Error al guardar publicación:", error);
    res.status(500).json({ mensaje: "Error del servidor" });
  }
});

app.post("/preguntar", async (req, res) => {
  const { pregunta } = req.body;

  if (!pregunta) {
    return res.status(400).json({ respuesta: "Por favor escribe una pregunta." });
  }

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: pregunta }],
      model: "gpt-3.5-turbo"
    });

    const respuesta = completion.choices[0].message.content;
    res.json({ respuesta });
  } catch (error) {
    console.error("❌ Error al contactar con OpenAI:", error);
    res.status(500).json({ respuesta: "Ocurrió un error al contactar con Elyos IA." });
  }
});

// 🚀 Iniciar servidor
// Obtener comentarios de un post
app.get("/api/comentarios/:postId", async (req, res) => {
  const { postId } = req.params;

  // Verifica que sea un ObjectId válido
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ mensaje: "ID de publicación inválido." });
  }

  try {
    const comentarios = await Comentario.find({ postId });
    res.json(comentarios);
  } catch (error) {
    console.error("Error al obtener comentarios:", error);
    res.status(500).json({ mensaje: "Error del servidor al obtener comentarios" });
  }
});

// Ruta para dar o quitar like a un post
app.post("/api/comunidad/:postId/like", async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ mensaje: "Publicación no encontrada" });

    post.likes += 1; // ← aquí puedes alternar si usas usuarios en el futuro
    await post.save();

    res.json({ likes: post.likes });
  } catch (error) {
    console.error("Error al dar like:", error);
    res.status(500).json({ mensaje: "Error del servidor" });
  }
});

// Crear nuevo comentario
app.get("/api/comunidad", async (req, res) => {
  try {
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 5;
    const skip = (pagina - 1) * limite;

    const posts = await Post.find()
      .sort({ fecha: -1 })
      .skip(skip)
      .limit(limite);

    const postsConAvatar = await Promise.all(
      posts.map(async (post) => {
        const user = await Usuario.findOne({ usuario: post.autor });
        return {
          _id: post._id,
          autor: post.autor,
          contenido: post.contenido,
          fecha: post.fecha,
          likes: post.likes,
          avatar: user?.avatar || "img/default-avatar.png"
        };
      })
    );

    res.json(postsConAvatar);
  } catch (error) {
    console.error("Error al obtener publicaciones:", error);
    res.status(500).json({ mensaje: "Error del servidor" });
  }
});

server.listen(PORT, () => {
  console.log(`🟢 Servidor corriendo en http://localhost:${PORT}`);
});

io.on("connection", (socket) => {
  console.log("🟣 Usuario conectado al chat");

  socket.on("mensaje", async ({ autor, contenido }) => {
    const nuevoMensaje = new Mensaje({ autor, contenido });
    await nuevoMensaje.save();

    io.emit("mensaje", {
      autor,
      contenido,
      fecha: nuevoMensaje.fecha,
    });
  });

  socket.on("disconnect", () => {
    console.log("🔴 Usuario desconectado del chat");
  });
});
