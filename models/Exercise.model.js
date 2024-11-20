const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const exerciseSchema = new Schema({
    name: {type: String, required: true, unique: true},
    description: {type: String, required: true},
    category: {type: String, enum: ["lower body", "upper body", "full body", "core", "cardio"], required: true},
    difficulty: {type: String, enum:["easy", "medium", "hard"], required: true},
});

const Exercise = mongoose.model("Exercise", exerciseSchema);

module.exports = Exercise;