const express = require("express");
const router = express.Router();
const mongoose = require ("mongoose");

const Exercise = require("../models/Exercise.model");   



router.get("/exercises", (req, res, next) => {
    Exercise.find({})
        .then((exercises) => {
            console.lot("retrieved exercises: ", exercises);
            res.status(201).json(exercises)
        })
        .catch((error) => {
            console.log("error while retreaving exercises", error);
            res.status(500).json({error: "Failed to retrieve exercises"});
        })
});

