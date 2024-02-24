const express = require('express');
const router = express.Router();
const zod = require("zod");
const { User, Sportname, Sports } = require("../models");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("./config");
const passport = require('passport');
const bcrypt = require('bcrypt');
const saltRounds = 10;

//passport
const initializePassport = require("./passport");
initializePassport();

// Signup route
router.post('/signup', async (req, res) => {
    try {
        // Validate request body
        const { username, email, password, role } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ where: { email: email } });
        if (existingUser) {
            console.log("User already exists");
            return res.json({ message: "User already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create a new user
        const user = await User.create({ userName: username, email: email, password: hashedPassword, role, sessions: "" });

        const payload = {
            sub: user.id,
            username: user.username,
            id: user.id,
        };

        // Generate JWT token
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
        console.log(token);
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

//sigin route
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
        console.log(token);
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

//protected route : used for send user details
router.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
    // console.log(req.user)
    console.log("accessed protected route,", req.user.dataValues.userName);
    res.json({ message: 'You accessed a protected route!', user: req.user.dataValues.userName,role:req.user.dataValues.role });

});

//route to send sports craeted
router.get('/sports-names', async (req, res) => {
    // console.log("accessed /sportsname")
    try {
        const sportsNames = await Sportname.findAll({
            include: [
                {
                    model: User,
                    attributes: ['userName'],
                }
            ],
            attributes: ['title', 'userId', 'id']
        });

        const result = sportsNames.map(sport => ({
            sportTitle: sport.title,
            userName: sport.User.userName,
            sportId: sport.id,
        }));


        console.log(result);
        res.json(result);
    } catch (error) {
        console.error('Error fetching sports names and user names:', error);
        res.status(500).send('An error occurred while fetching the sports names and associated user names.');
    }
});

//route to create a new sport
router.post('/new-sport', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { title } = req.body;
        const Sport = await Sportname.create({
            title,
            userId: req.user.dataValues.id
        })
        if (Sport) {
            res.json({
                message: "sport created successfully",
                sportid: Sport.id
            })
        }
    }
    catch (err) {
        res.json(err);
    }
})

//route to create a sports-session
router.post('/sports-session', passport.authenticate('jwt', { session: false }), async (req, res) => {
    // Destructure the required fields from the request body
    const { title, date, time, location, players: initialPlayers, additional: additionalInput, Sporttitle, id } = req.body;

    try {
        const user = await User.findByPk(req.user.dataValues.id);
        console.log(user.id);

        // Create a new sports session in the database
        const newSession = await Sports.create({
            title,
            date,
            time,
            location,
            players: initialPlayers,
            additional: additionalInput,
            userId: user.id,
            sportId: id

        });

        // Check if user has existing sessions and append the new session ID
        let updatedSessions = user.sessions ? `${user.sessions},${newSession.id}` : `${newSession.id}`;

        // Update user's sessions
        await user.update({ sessions: updatedSessions });



        // Respond with the created sports session
        res.status(201).json(newSession);
    } catch (error) {
        console.error('Error creating sports session:', error);
        res.status(500).send('Failed to create sports session.');
    }
});

//route to get session
router.post('/sports-by-id', async (req, res) => {
    const { sportId } = req.body;
    console.log(sportId)
  
    try {
      const sportsWithUsers = await Sports.findAll({
        where: { sportId }, // Filtering by sportId
        include: [{
          model: User,
          attributes: ['userName'] 
        }]
      });
  
      const responseData = sportsWithUsers.map(sport => ({
        title: sport.title,
        date: sport.date,
        time: sport.time,
        location: sport.location,
        userName: sport.User.userName 
      }));
  
      res.json(responseData);
    } catch (error) {
      console.error('Error fetching sports with user names:', error);
      res.status(500).send('Internal Server Error');
    }
  });





module.exports = router;
