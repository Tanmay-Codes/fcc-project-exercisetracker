const express = require("express");
const app = express();
const cors = require("cors");
const urlParser = require("url");
const mongoose = require("mongoose");
const Users = require("./models/User");
const Exercise = require("./models/Exercise");
const { error } = require("console");
require("dotenv").config();
app.use(cors());
const uri = process.env.MONGO_URI;
async function connectDb() {
  try {
    await mongoose.connect(uri);
    console.log("connected to Database");
  } catch {
    console.log("Error connecting to database");
  }
}
connectDb();
app.use(express.static(__dirname + "/public/"));
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", async (req, res) => {
  const userName = req.body.username;
  const newUser = new Users({
    username: userName,
  });
  const result = await newUser.save();
  res.json(result);
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  const userId = req.params._id;
  const { description, duration, date } = req.body;
  const dateObj = new Date();
  try {
    const { username } = await Users.findById(userId);
    if (username) {
      const newExercise = new Exercise({
        userId,
        username,
        description,
        duration,
        date: date ? new Date(date) : dateObj,
      });
      await newExercise.save();
      res.json({
        username,
        description,
        duration,
        date: date ? new Date(date).toDateString() : dateObj.toDateString(),
        _id: userId,
      });
    } else {
      res.json({ error: "User not found" });
    }
  } catch (err) {
    console.log(err);
    res.json({ code: 400, err: "something went wrong!" });
  }
});

app.get("/api/users/:_id/logs", async (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;
  let filter = {};
  let dateFilter = {};
  if (from) dateFilter["$gte"] = new Date(from);
  if (to) dateFilter["$lte"] = new Date(to);
  if (from || to) filter.date = dateFilter;
  try {
    const user = await Users.findById(userId);
    if (!user) {
      res.json({ error: "User not found" });
      return;
    } else {
      filter.userId = userId;
    }
    console.log(filter);
    const exercises = await Exercise.find(filter, "-userId -username").limit(
      +limit ?? 500
    );
    console.log(exercises);
    const logs = exercises.map((items) => {
      return {
        description: items.description,
        duration: items.duration,
        date: items.date,
      };
    });
    console.log(logs);
    res.json({
      username: user.username,
      count: exercises.count,
      _id: userId,
      log: logs,
    });
  } catch (err) {
    console.log(err);
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
