const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Plans = require("../models/Plans.model");

const Exercise = require("../models/Exercise.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

router.get("/exercises", (req, res, next) => {
  Exercise.find({})
    .then((exercises) => {
      console.log("retrieved exercises: ", exercises);
      res.status(201).json(exercises);
    })
    .catch((error) => {
      console.log("error while retreaving exercises", error);
      res.status(500).json({ error: "Failed to retrieve exercises" });
    });
});

router.get("/exercises/:exerciseId", isAuthenticated, (req, res, next) => {
  const { exerciseId } = req.params;

  Exercise.findById(exerciseId)
    .then((exerciseFromDB) => {
      res.status(201).json(exerciseFromDB);
    })
    .catch((error) => {
      console.log(
        `error while retreaving exercise with Id ${exerciseId}`,
        error
      );
      res
        .status(500)
        .json({ message: "Failed to retrieve exercise with that Id" });
    });
});

router.post("/exercises", isAuthenticated, (req, res, next) => {
  const { name, description, category, difficulty } = req.body;

  Exercise.create({ name, description, category, difficulty })
    .then((response) => {
      res.json(response);
    })
    .catch((error) => {
      console.log("error while creating the exercise", error);
      res.status(500).json({ error: "error while creating the exercise" });
    });
});

router.post("/plans/:planId", async (req, res) => {
  const { planId } = req.params;
  const { exerciseId, repetitions } = req.body;

  try {
    const plan = await Plans.findById(planId);

    if (!plan) {
      return res.status(404).send({ error: "Plan not found" });
    }

    // Add the exercise to the exercises array
    plan.exercises.push({ exerciseId, repetitions }); // Assuming 'exercises' is an array in the Plan model

    // Save the updated plan
    await plan.save();

    // Return the updated plan or a success message
    return res.status(200).json(plan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add exercise to the plan" });
  }
});

router.patch("/exercises/:exerciseId", isAuthenticated, (req, res, next) => {
  const { exerciseId } = req.params;

  Exercise.findByIdAndUpdate(exerciseId, req.body, {
    new: true,
    runValidators: true,
  })
    .then((updatedExercise) => {
      res.status(201).json(updatedExercise);
    })
    .catch((error) => {
      console.log("unable to update exercise", error);
      res.status(500).json({ error: "unable to update exercise" });
    });
});

router.delete("/exercises/:exerciseId", isAuthenticated, (req, res, next) => {
  const { exerciseId } = req.params;

  Exercise.findByIdAndDelete(exerciseId)
    .then(() => {
      res.status(201).json({ message: "The exercise has been deleted" });
    })
    .catch((error) => {
      console.log("error deleting exercise", error);
      res.status(500).json({ error: "error deleting exercise" });
    });
});

module.exports = router;
