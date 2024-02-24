const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const PassportJWT = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const { User } = require("../models");

const app = express();
app.use(express.json());

const {JWT_SECRET} = require("./config");

const initializePassport = () => {
    passport.use(new PassportJWT({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: JWT_SECRET,
    },
        async (jwtPayload, done) => {

            // console.log(jwtPayload.id);
            try {
                const user = await User.findByPk(jwtPayload.id);
                if (user) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            } catch (error) {
                return done(error, false);
            }
        }
    ));

}

module.exports = initializePassport;








































// // passport.js
// const express = require("express");
// const app = express();
// const passport = require('passport');
// const JwtStrategy = require('passport-jwt').Strategy;
// const ExtractJwt = require('passport-jwt').ExtractJwt;
// const { User } = require("../models"); // Assuming your User model is exported from "./models"
// const { JWT_SECRET } = require("./config");

// const initializePassport = () => {
//     console.log("in pasport....");
//     passport.use(new JwtStrategy({
//         jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//         secretOrKey: JWT_SECRET
//     }, async (jwtPayload, done) => {
//         try {
//             // Find the user based on the JWT token
//             const user = await User.findByPk(jwtPayload.userId);
//             if (!user) {
//                 return done(null, false);
//             }
//             console.log("user access");
//             return done(null, user);
//         } catch (error) {
//             return done(error, false);
//         }
//     }));
// };

// module.exports = initializePassport;
