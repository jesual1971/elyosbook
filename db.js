const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("🟢 Conectado a MongoDB con Mongoose"))
.catch((err) => console.error("🔴 Error conectando a MongoDB:", err));

