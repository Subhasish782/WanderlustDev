const User = require("../models/user");


//user singup controller:-
module.exports.renderSingnupForm=(req,res)=> {
    res.render("users/signup");
};


module.exports.signup= async(req,res)=> {
    try{
        let{ username, email, password } = req.body;
        const newUser=new User ({email,username});
        const registeredUser=await User.register(newUser,password);
        console.log(registeredUser);
        req.login(registeredUser,(err)=> {
            if(err) {
                return next(err);
            }
            req.flash("success","Welcome to Wanderlust!");
            res.redirect("/listings");
        })  
    }catch(e) {
        req.flash("error",e.message);
        res.redirect("/signup");
    }
    
};

//Login controller:-

module.exports.renderLoginForm=(req,res)=> {
    res.render("users/login.ejs");
};

module.exports.login=async(req,res)=> {
    req.flash("success","Welcome Back to Wanderlust!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

//Logout controller:-

module.exports.logout=(req,res,next)=> {
    req.logout((err)=> {
        if(err) {
            return next(err);
        }
        req.flash("success","you are logges out!");
        res.redirect("/listings");
    })
};

