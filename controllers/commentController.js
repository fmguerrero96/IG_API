const Comment = require('../models/comment');
const { body, validationResult} = require('express-validator');
const jwt = require("jsonwebtoken");