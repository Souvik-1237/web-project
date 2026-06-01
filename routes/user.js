const express = require('express');
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");

const userController = require("../controller/users.js");
const user = require('../models/user.js');

router.route("/signup")
.get(userController.renderSignup)
.post(wrapAsync(userController.signup));

router.route("/login")
.get(userController.renderLoginForm)
.post(passport.authenticate("local", {failureRedirect: '/login', failureFlash: true}), wrapAsync(userController.login));


router.get("/logout", userController.logout);

module.exports = router;