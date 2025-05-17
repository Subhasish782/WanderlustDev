const express = require("express");
const router = express.Router();
const User = require("../models/user");
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');
const { saveRedirectUrl } = require("../middleware");
const usersController = require("../controllers/users");

//signup route:-

router
.route("/signup")
.get(usersController.renderSingnupForm)
.post(wrapAsync(usersController.signup));


//Login Route:-

router
.route("/login")
.get(usersController.renderLoginForm)
.post(
    saveRedirectUrl,
    passport.authenticate("local", { 
        failureRedirect:'/login',
        failureFlash:true,
    }),
    usersController.login,
);

//LogOut Route:-

router.get("/logout",usersController.logout);


module.exports = router;