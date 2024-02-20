const express = require('express');
const router = express.Router();
const zod = require("zod");
const { User } = require("../models");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("./config");
const passport = require('passport');
const bcrypt = require('bcrypt');
const saltRounds = 10;

//passport
const initializePassport = require("./passport");
initializePassport();

//zod
// const signupBodySchema = zod.object({
//     username: zod.string().email(),
//     password: zod.string(),
//     role: zod.string() // Assuming role is part of the signup body
// });

// Signup route
router.post('/signup', async (req, res) => {
    try {
        // Validate request body
        const { username,email, password, role } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ where: { email: email } });
        if (existingUser) {
            console.log("User already exists");
            return res.json({ message: "User already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create a new user
        const user = await User.create({ userName:username, email:email,password:hashedPassword, role, sessions: "" });

        const payload = {
            sub: user.id, 
            username: user.username ,
            id: user.id,
        };

        // Generate JWT token
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        res.json({
            message: "User created successfully",
            token: token,
            userid: user.id,
            username: user.username,
            role: user.role
        });

    } catch (error) {
        console.error("Error during signup:", error);
        res.status(400).json({ message: "Signup failed" });
    }
});

router.post('/signin', async (req, res) => {
    try {
        
        const { email, password } = req.body;

        // Check if the user exists
        const user = await User.findOne({ where: { email: email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify password 
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // generate JWT token
        const payload = {
            sub: user.id,
            username: user.userName,
            id: user.id,
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        // Respond with token and user details
        res.json({
            message: "User signed in successfully",
            token: token,
            userid: user.id,
            username: user.userName,
            role: user.role
        });

    } catch (error) {
        console.error("Error during signin:", error);
        res.status(500).json({ message: "Signin failed" });
    }
});











router.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
    console.log("prooooo")
    res.json({ message: 'You accessed a protected route!', user: req.user });
});

module.exports = router;
