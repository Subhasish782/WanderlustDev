const express= require("express");
const router=express.Router({mergeParams:true});
const wrapAsync = require('../utils/wrapAsync');
const expressError = require('../utils/expressError');
const Review = require('../models/reviews');
const Listing = require('../models/listing');
const { validateReview, isLoggedIn,isreviewAuthor } = require('../middleware'); 
const reviewcontroller = require('../controllers/reviews');



//Review Routes:-
// (1)POST REVIEW ROUTE:-

router.post("/",
    isLoggedIn,
    validateReview,
    wrapAsync(reviewcontroller.createReview),
);
        

// (2)DELETE REVIEW ROUTE:-

router.delete("/:reviewId",
    isLoggedIn,
    isreviewAuthor,
    wrapAsync(reviewcontroller.destroyReview),
);
        
module.exports=router;