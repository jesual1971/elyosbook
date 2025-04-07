const mongoose = require("mongoose");

// Pega aquí tu URI completa entre comillas
mongodb+srv://accpanamerican71:bvH2y0rVoxfwkewS@cluster0.2czato0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ Conexión exitosa a MongoDB Atlas");
  process.exit();
})
.catch((err) => {
  console.error("❌ Fallo al conectar:", err.message);
  process.exit(); 
});
