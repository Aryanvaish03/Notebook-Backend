const express = require('express');
const router = express.Router();
var fetchUser = require('../middleware/fetchUser')
const { body, validationResult } = require('express-validator');
const Notes = require('../models/Notes')

// Route1: Get all the notes   GET "/api/notes". LogIn required
router.get('/fetchNotes', fetchUser, async (req, res) => {

    try {
        const notes = await Notes.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server error occured");
    }
});

// Route2: Add a new note POST "/api/notes". LogIn Required
router.post('/addNote', fetchUser, [
    body('title', 'Enter a title').exists(),
    body('description', 'Enter description').exists()
],
    async (req, res) => {

        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const { title, description, tag } = req.body
            const note = new Notes({
                title, description, tag, user: req.user.id
            })
            const savedNote = await note.save();
            res.json(savedNote);
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server error occured");
        }
    });


// Route3: Update a note using : PUT /api/notes/updateNote  Login Required
router.put('/updateNote/:id', fetchUser, async (req, res) => {

    try {
        const {title, description, tag} = req.body;
        const newNote = {};
        if(title) {newNote.title = title}
        if(description) {newNote.description = description}
        if(tag) {newNote.tag = tag}

        // Find the note to be updated 

        let note = await Notes.findById(req.params.id)
        if(!note) { return res.status(404).send("Note Not Found"); }
        if(note.user.toString() !== req.user.id) {
            res.status(401).send("Access Denied");
        }

        note = await Notes.findByIdAndUpdate(req.params.id, {$set: newNote}, {new: true});
        res.json(note);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server error occured");
    }
});

// Route4: Delete note using : DELETE /api/notes/deleteNote  Login Required
router.delete('/deleteNote/:id', fetchUser, async (req, res) => {

    // Find the note to be deleted 
    try {
        let note = await Notes.findById(req.params.id)
        if(!note) { return res.status(404).send("Note Not Found"); }
        if(note.user.toString() !== req.user.id) {
            res.status(401).send("Access Denied");
        }
        // Delete if it belongs to LoggedInUser
        note = await Notes.findByIdAndDelete(req.params.id);
        res.json({success: "Note deleted", note});
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server error occured");
    }
});


module.exports = router;