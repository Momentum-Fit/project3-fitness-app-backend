const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const planSchema = new Schema({
    name: {type: String, required: true, unique: true},
    description: {type: String, required: true},
    category: {type: String, enum: ["strength", "hiit", "low impact", "cardio"], required: true},
    length: {type: Number, enum: [4, 8, 12]},
    exercises: [{type: Schema.Types.ObjectId, ref: "Exercise"}],
});

const Plan = mongoose.model("Plan", planSchema);

module.exports = Plan;