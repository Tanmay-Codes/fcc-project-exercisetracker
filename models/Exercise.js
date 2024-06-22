const mongoose = require("mongoose");

const ExerciseSchema = mongoose.Schema({
  userId: String,
  userame: String,
  description: String,
  duration: Number,
  date: String,
});

module.exports = mongoose.model("Exercise", ExerciseSchema);
