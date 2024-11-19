const express = require("express");
const router = express.Router();
const { TaskList } = require('../model/taskList')


router.post("/save", async (req, res) => {

    if (!req.body) {
        return res.status(400).send("task data is required");
    }

    console.log(req.body);

    const task = new TaskList({
        userId: req.body.userId,
        title: req.body.title,
        tasks: req.body.tasks,
    });

    await task.save();

    // await note.save();
    res.status(201).json({ success: true});

    console.log("");

});



module.exports = router;
