const express = require('express');
const cors = require('cors');
require('dotenv').config()

const app = express();

const PORT = (process.env.PORT || 2000);

app.use(express.json());
app.use(cors());

app.listen(PORT, () => {
    console.log(PORT)
    console.log(`Listening on port ${PORT}`)
})