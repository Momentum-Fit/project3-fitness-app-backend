const express = require("express");
const router = express.Router();
const mongoose = require ("mongoose");

const Exercise = require("../models/Exercise.model");   
const Plans = require("../models/Plans.model");   



router.get("/plans", (req, res, next) => {
    Plans.find({})
    .populate("exercises")
        .then((plans) => {
            console.lot("retrieved plans: ", plans);
            res.status(201).json(plans);
        })
        .catch((error) => {
            console.log("error while retreaving plans", error);
            res.status(500).json({error: "Failed to retrieve plans"});
        })
});