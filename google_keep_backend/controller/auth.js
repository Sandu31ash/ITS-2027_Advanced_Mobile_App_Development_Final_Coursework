const express = require("express");
const router = express.Router();
const { User } = require('../model/user')


router.post("/signUp", async (req, res) => {

    let user = await User.findOne({
        email: req.body.email
    });

    if (user) return res.status(200).send("User already registered.");

    user = new User({
        name: req.body.name,
        email: req.body.email,
        image: req.body.image,
        userId: req.body.userId
    });


    await user.save();

    console.log(user);
    res.status(200).send(user);

});

module.exports = router;
