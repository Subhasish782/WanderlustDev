if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
// console.log(process.env.SECRET);

const express = require('express');
const app = express();
const ejs = require('ejs');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const expressError= require('./utils/expressError');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User= require('./models/user');



const listingsRouter = require("./routes/listing");
const reviewsRouter = require("./routes/review");
const userRouter = require("./routes/user");




const port = process.env.PORT || 3000;
const dbUrl = process.env.ATLASDB_URL;
if (!dbUrl) {
    console.error('MongoDB URL not found in environment variables');
    process.exit(1);
}

// Database connection with better error handling
main().catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
});

async function main() {
    await mongoose.connect(dbUrl);
    console.log('Connected to MongoDB Atlas');
}

// Middleware
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Session store configuration with proper error handling
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 3600,
    crypto: {
        secret: process.env.SECRET || 'fallback_secret'
    },
    mongoOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
});

store.on("error", function(error) {
    console.error("Session Store Error:", error);
});

store.on("connected", function() {
    console.log("Session Store Connected");
});

const sessionOption = {
    store,
    secret: process.env.SECRET || 'fallback_secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }
}

app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
})

// app.get("/demouser",async(req,res)=> {
//     let fakeUser=new User ({
//         email:"student@gmail.com",
//         username:"delta-student"
//     })
//     let registereddUser=await User.register(fakeUser,"helloworld");
//     res.send(registereddUser);
// })

// Router Middleware:-
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

app.all("*", (req, res, next) => {
    next(new expressError("Page not found", 404));
});

// Error-handling middleware:-
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    console.error(`Error: ${message} (Status Code: ${statusCode})`);
    res.status(statusCode).render('error', { err: { message, statusCode } });
});

// Server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});


