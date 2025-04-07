const mongoose = require("mongoose");

const uri = process.env.MONGO_URI;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("✅ Render SÍ puede conectarse a MongoDB Atlas.");
  process.exit();
})
.catch((err) => {
  console.error("❌ Render NO puede conectar con MongoDB Atlas:", err.message);
  process.exit(1);
});
