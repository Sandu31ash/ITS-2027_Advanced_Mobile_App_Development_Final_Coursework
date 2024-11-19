const express = require("express");
const router = express.Router();
const { Note } = require('../model/note')
const {TaskList} = require('../model/taskList')


router.post("/save", async (req, res) => {

    if (!req.body.noteData) {
        return res.status(400).send("Note data is required");
    }

    const note = new Note({
        userId: req.body.noteData.userId,
        title: req.body.noteData.title,
        content: req.body.noteData.content,
        backgroundColor: req.body.noteData.backgroundColor,
        images: req.body.noteData.images,
        pinned: req.body.noteData.pinned,
        reminder: req.body.noteData.reminder
    });

   await note.save();
    res.status(201).json({ success: true, data: note });

    console.log(note);

});

// Get all notes by userId
router.get("/:userId", async (req, res) => {
    console.log(req.params.userId);


    const notes = await Note.find({ userId: req.params.userId });

    const taskList = await TaskList.find({ userId: req.params.userId });

    //return selected data of the notes
    const items = notes.map((note) => {
        return {
            id: note._id,
            title: note.title,
            content: note.content,
            backgroundColor: note.backgroundColor,
            images: note.images,
            pinned: note.pinned,
            reminder: note.reminder,
            type: 'note'
        }
    });

    //return selected data of the taskList
    const taskItems = taskList.map((task) => {
        return {
            id: task._id,
            title: task.title,
            tasks: task.tasks,
            pinned: task.pinned,
            reminder: task.reminder,
            type: 'tasklist'
        }
    });

    //merge the two arrays
    const allItems = items.concat(taskItems);

    //sort the array by date
    allItems.sort((a, b) => {
        return new Date(b.reminder) - new Date(a.reminder);
    });

    res.status(200).json({ success: true, data: allItems });

});

module.exports = router;
