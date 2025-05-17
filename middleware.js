const Listing = require("./models/listing");
const { listingSchema,reviewSchema } = require("./schema");
const expressError = require('./utils/expressError');
const Review = require("./models/reviews");



// Middleware to check if user is logged in:-

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl=req.originalUrl;
        req.flash("error", "You must be logged in to access this page.");
        return res.redirect("/login");
    }
    next();
};

// Middleware to check if user is logged in and save redirect URL:-

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    } 
    next();
};

// Middleware to check if user is the owner of the listing:-

module.exports.isOwner = async (req,res,next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    if (!listing.owner.equals(res.locals.currentUser._id)) {
        req.flash("error", "You are not the owner of this listing!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

// Middleware to validate listing data:-

module.exports.validateListing = (req, res, next) => {

    let {error} = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new expressError(errMsg,400);
    }else {
        next();
    }
};


// (( Middleware to validate review data )):-

// module.exports.validateReview = (req, res, next) => {
//     const { error } = reviewSchema.validate(req.body);
//     if (error) {
//         const errMsg = error.details[0].message.replace(/"/g, "'");
//         return res.status(400).render("listings/new.ejs", { error: errMsg });
//     }
//     next();
// };

module.exports.validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new expressError(errMsg,400);
    }else {
        next();
    }
};

// Middleware to check if user is the owner of the review:-

module.exports.isreviewAuthor = async (req,res,next) => {
    const { id,reviewId} = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(res.locals.currentUser._id)) {
        req.flash("error", "You are not author of this  review!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}
