const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

const { isAuthenticated } = require("../middleware/jwt.middleware.js");

const saltRounds = 10;
const fileUploader = require('../config/cloudinary.config');
const { expressjwt } = require("express-jwt");

router.post("/signup", (req, res, next) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    res.status(400).json({ message: "Provide email, password and name" });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Provide a valid email address." });
    return;
  }

  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({
      message:
        "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.",
    });
    return;
  }


  User.findOne({ email })
    .then((foundUser) => {
      if (foundUser) {
        res.status(400).json({ message: "User already exists." });
        return;
      }

      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(password, salt);

      return User.create({ email, password: hashedPassword, name });
    })
    .then((createdUser) => {
      console.log(createdUser);
      const { email, name, _id } = createdUser;

      const payload = { _id, email, name };

      const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: "6h",
      });

      res.status(201).json({ authToken });
    })
    .catch((err) => next(err));
});

router.post("/login", (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Provide email and password." });
    return;
  }

  User.findOne({ email })
    .then((foundUser) => {
      if (!foundUser) {
        res.status(401).json({ message: "User not found." });
        return;
      }

      const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

      if (passwordCorrect) {
        const { _id, email, name } = foundUser;

        const payload = { _id, email, name };

        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
          algorithm: "HS256",
          expiresIn: "6h",
        });

        res.status(200).json({ authToken: authToken });
      } else {
        res.status(401).json({ message: "Unable to authenticate the user" });
      }
    })
    .catch((err) => next(err));
});

router.post("/upload", fileUploader.single("imageUrl"), (req, res, next) => {
  if(!req.file) {
    next(new Error("No file uploaded"));
    return
  }
  res.status(200).json({fileUrl: req.file.path});
});

router.put("/users", isAuthenticated, (req, res, next) => {
  // req.payload._id

  // const { updatedData } = req.body;

console.log("id", req.payload._id)
console.log("body", req.body)
  User.findByIdAndUpdate(req.payload._id, req.body, { new: true })
    .then((updatedUser) => {
      console.log("updatedUser",updatedUser)
      if(!updatedUser) {
        return res.status(404).json({message: "User not found"})
      }
      res.status(200).json(updatedUser);
    })
    .catch((err) => {
      console.error("error updating user", err)
      res.status(500).json({message: "error updating user profile"})
    });
});

router.get("/verify", isAuthenticated, async (req, res, next) => {
  try {
    const user = await User.findById(req.payload._id)
    res.status(200).json(user); 
  } catch (err) {
    console.error("Error in /auth/verify:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("users/:userId", isAuthenticated, (req, res, next) => {
  const { userId } = req.params;

  if(req.payload._id !== userId) {
    return res.status(403).json({message: "Unauthorized"})
  }

  User.findById(userId)
    .then(user => {
      if(!user) {
        return res.status(404).json({message: "User not found"})
      }
      res.status(200).json(user);
    })
    .catch (err => {
      console.log("error fetching user", err)
      res.status(500).json({message: "error fetching user profile"})
    })
});

router.get("/me", isAuthenticated, (req, res, next) => {
  
  const userId = req.payload._id;
  if (!userId) {
    return res.status(400).json({ message: "Invalid or missing user ID" });
  }

  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(user); 
    })
    .catch((err) => {
      console.error("Error fetching user:", err);
      res.status(500).json({ message: "Internal server error" });
    });
});


module.exports = router;
