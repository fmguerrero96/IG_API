const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
require('dotenv').config()

const app = express();

// Import routes
const userRoutes = require("./routes/userRoutes")

const PORT = (process.env.PORT || 2000);

app.use(express.json());
app.use(cors({ 
  credentials: true, //allow cookies to be sent
  origin: 'http://localhost:5173' //front-end origin
}));

// Connect to mongodb with mongoose
mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGODB_URI;

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

// Use imported routes
app.use('/', userRoutes);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})