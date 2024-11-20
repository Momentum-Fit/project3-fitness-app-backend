const express = require("express");
const router = express.Router();
const mongoose = require ("mongoose");

const Exercise = require("../models/Exercise.model");   
const { isAuthenticated } = require("../middleware/jwt.middleware");

router.get("/exercises", (req, res, next) => {
    Exercise.find({})
        .then((exercises) => {
            console.log("retrieved exercises: ", exercises);
            res.status(201).json(exercises)
        })
        .catch((error) => {
            console.log("error while retreaving exercises", error);
            res.status(500).json({error: "Failed to retrieve exercises"});
        })
});

router.get("/exercises/:exerciseId", (req, res, next) => {
    const {exerciseId} = req.params;

    Exercise.findById(exerciseId)
        .then((exerciseFromDB) => {
            res.status(201).json(exerciseFromDB)
        })
        .catch((error) => {
            console.log(`error while retreaving exercise with Id ${exerciseId}`, error)
            res.status(500).json({message: "Failed to retrieve exercise with that Id"})
        })
})

router.post("/exercises", (req, res, next) => {
    const {name, description, category, difficulty} = req.body;

    Exercise.create({name, description, category, difficulty})
        .then((response) => {
                res.json(response)
        })
        .catch((error) => {
            console.log("error while creating the exercise", error);
            res.status(500).json({error: "error while creating the exercise"});
        })
})

module.exports = router;