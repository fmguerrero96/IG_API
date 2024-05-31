//Create User 
exports.createUser = (req, res) => {
    // const {username, password} = req.body;
    res.json({requestData: req.body})
}