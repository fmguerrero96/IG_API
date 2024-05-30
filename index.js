const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
require('dotenv').config()

const app = express();

const PORT = (process.env.PORT || 2000);

app.use(express.json());
app.use(cors());

// Connect to mongodb with mongoose
mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGODB_URI;

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})