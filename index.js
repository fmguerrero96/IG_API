const express = require('express');
require('dotenv').config()

const app = express();

const PORT = (process.env.PORT || 2000);

app.listen(PORT, () => {
    console.log(PORT)
    console.log(`Listening on port ${PORT}`)
})