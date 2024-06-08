const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const passport = require('passport');
const passportConfig = require('./passport-config');
const cookieParser = require('cookie-parser');
require('dotenv').config()

const app = express();
app.use(passport.initialize());

// Import routes
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");

const PORT = (process.env.PORT || 2000);

app.use(express.json());
app.use(cors({ 
  credentials: true, //allow cookies to be sent
  origin: 'http://localhost:5173' //front-end origin
}));
app.use(cookieParser())

// Connect to mongodb with mongoose
mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGODB_URI;

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

// Use imported routes
app.use('/', userRoutes);
app.use('/', postRoutes);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
});