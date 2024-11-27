const express = require("express");
const router = express.Router();
const mongoose = require ("mongoose");

const Exercise = require("../models/Exercise.model");   
const Plans = require("../models/Plans.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const Plan = require("../models/Plans.model");


router.get("/plans", (req, res, next) => {
    Plans.find({})
    .populate("exercises")
        .then((plans) => {
            console.log("retrieved plans: ", plans);
            res.json(plans);
        })
        .catch((error) => {
            console.log("error while retreaving plans", error);
            res.status(500).json({error: "Failed to retrieve plans"});
        })
});

router.get("/plans/:planId", isAuthenticated, (req, res, next) => {
    const {planId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(planId)) {
        res.status(201).json({message: "the specified Id is not valid"})
        return;
    }

    Plan.findById(planId)
        .populate("exercises")
        .then((plan) => {
            res.json(plan)
        })
        .catch((error) => {
            console.log(`error retrieving the plan with Id ${planId}`, error);
            res.status(500).json({error: "error retrieving the plan"})
        })
});

router.post("/plans", isAuthenticated, (req, res, next) => {
    const {name, description, category, length, exercises} = req.body;

    const formattedExercises = exercises.map((exercise) => ({
        exerciseId: mongoose.Types.ObjectId.isValid(exercise.exerciseId) 
            ? exercise.exerciseId 
            : new mongoose.Types.ObjectId(),
        repetitions: exercise.repetitions,
    }));

    Plans.create({name, description, category, length, exercises: formattedExercises})
        .then((response) => {
            res.status(201).json(response)
        })
        .catch((error) => {
            console.log("error while creating plan", error);
            res.status(500).json({error: "error while creating plan"})
        })
});

router.delete("/plans/:planId", isAuthenticated, (req, res, next) => {
    const {planId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(planId)) {
        res.status(400).json({message: "specified Id is not valid"})
        return;
    }

    Plan.findByIdAndDelete(planId)
        .then(() => {
            res.json({message: `Plan with ID: ${planId} has been deleted successfully`})
        })
        .catch((error) => {
            console.log("could not delete plan", error);
            res.status(500).json({message: "could not delete plan"})
        })
});

router.patch("/plans/:planId", isAuthenticated, async (req, res, next) => {
    const {planId} = req.params;

    try{
        const {
            name,
            description,
            category,
            length,
            exercises
          } = req.body;
        const planData = {
            name,
            description,
            category,
            length,
            exercises
        };
        for (const prop in planData) {
            if(planData[prop] === undefined) {
                delete planData[prop];
            }
        }

        const updated = await Plan.findByIdAndUpdate(planId, planData, {
            new: true,
            runValidators: true,
        });

        return res.status(200).json(updated);
        } catch(error) {
            console.log(error, "unable to update plan");
            return res.status(500).json({message: "unable to update plan"})
            }
    }
)

module.exports = router;