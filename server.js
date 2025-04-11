
// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const User = require('./models/User');
// const Exercise = require('./models/Exercise');
// // const dotenv = require('dotenv');
// // dotenv.config();
// const app = express();

// // Middleware
// app.use(cors());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

// // Connect to MongoDB
// // mongoose.connect('mongodb://127.0.0.1:27017/exercise-tracker', {
// //   useNewUrlParser: true,
// //   useUnifiedTopology: true,
// // });
// require('dotenv').config();
// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })


// // Routes

// // POST /api/users - Create a new user
// app.post('/api/users', async (req, res) => {
//   const { username } = req.body;
//   try {
//     const newUser = new User({ username });
//     await newUser.save();
//     res.json({ username: newUser.username, _id: newUser._id });
//   } catch (err) {
//     res.status(500).json({ error: 'Error creating user' });
//   }
// });

// // GET /api/users - Get all users
// app.get('/api/users', async (req, res) => {
//   try {
//     const users = await User.find({}, 'username _id');
//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ error: 'Error fetching users' });
//   }
// });

// // POST /api/users/:_id/exercises - Add an exercise
// app.post('/api/users/:_id/exercises', async (req, res) => {
//   const { _id } = req.params;
//   const { description, duration, date } = req.body;

//   try {
//     const user = await User.findById(_id);
//     if (!user) return res.status(404).json({ error: 'User not found' });

//     const exerciseDate = date ? new Date(date) : new Date();
//     const newExercise = new Exercise({
//       userId: _id,
//       description,
//       duration: parseInt(duration),
//       date: exerciseDate,
//     });

//     await newExercise.save();

//     res.json({
//       username: user.username,
//       description: newExercise.description,
//       duration: newExercise.duration,
//       date: newExercise.date.toDateString(),
//       _id: user._id,
//     });
//   } catch (err) {
//     res.status(500).json({ error: 'Error adding exercise' });
//   }
// });

// // GET /api/users/:_id/logs - Get exercise logs
// app.get('/api/users/:_id/logs', async (req, res) => {
//   const { _id } = req.params;
//   const { from, to, limit } = req.query;

//   try {
//     const user = await User.findById(_id);
//     if (!user) return res.status(404).json({ error: 'User not found' });

//     let filter = { userId: _id };
//     if (from || to) {
//       filter.date = {};
//       if (from) filter.date.$gte = new Date(from);
//       if (to) filter.date.$lte = new Date(to);
//     }

//     let exercises = await Exercise.find(filter)
//       .limit(parseInt(limit) || 0)
//       .select('description duration date');

//     exercises = exercises.map((exercise) => ({
//       description: exercise.description,
//       duration: exercise.duration,
//       date: exercise.date.toDateString(),
//     }));

//     res.json({
//       username: user.username,
//       count: exercises.length,
//       _id: user._id,
//       log: exercises,
//     });
//   } catch (err) {
//     res.status(500).json({ error: 'Error fetching logs' });
//   }
// });

// // Start the server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./models/User');
const Exercise = require('./models/Exercise');
require('dotenv').config();  // Loading environment variables

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error('MongoDB URI is missing in the environment variables.');
  process.exit(1);
}

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  });

// Routes

// POST /api/users - Create a new user
app.post('/api/users', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username is required' });

  try {
    const newUser = new User({ username });
    await newUser.save();
    res.json({ username: newUser.username, _id: newUser._id });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Error creating user' });
  }
});

// GET /api/users - Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username _id');
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// POST /api/users/:_id/exercises - Add an exercise
app.post('/api/users/:_id/exercises', async (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  if (!description || !duration) {
    return res.status(400).json({ error: 'Description and duration are required' });
  }

  try {
    const user = await User.findById(_id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const exerciseDate = date ? new Date(date) : new Date();
    const newExercise = new Exercise({
      userId: _id,
      description,
      duration: parseInt(duration),
      date: exerciseDate,
    });

    await newExercise.save();

    res.json({
      username: user.username,
      description: newExercise.description,
      duration: newExercise.duration,
      date: newExercise.date.toDateString(),
      _id: user._id,
    });
  } catch (err) {
    console.error('Error adding exercise:', err);
    res.status(500).json({ error: 'Error adding exercise' });
  }
});

// GET /api/users/:_id/logs - Get exercise logs
app.get('/api/users/:_id/logs', async (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  try {
    const user = await User.findById(_id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let filter = { userId: _id };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    let exercises = await Exercise.find(filter)
      .limit(parseInt(limit) || 0)
      .select('description duration date');

    exercises = exercises.map(exercise => ({
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString(),
    }));

    res.json({
      username: user.username,
      count: exercises.length,
      _id: user._id,
      log: exercises,
    });
  } catch (err) {
    console.error('Error fetching logs:', err);
    res.status(500).json({ error: 'Error fetching logs' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});