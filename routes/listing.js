const express = require("express");
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const Listing = require('../models/listing');
const { listingSchema } = require('../schema.js');
const { isLoggedIn, isOwner, validateListing } = require('../middleware');
const listingsController = require('../controllers/listings');
const multer  = require('multer');
const { storage } = require('../cloudConfig');
const upload = multer({ storage});


router
.route("/")
.get(wrapAsync(listingsController.index))
.post( 
    isLoggedIn, 
    upload.single('listing[image]'),
    validateListing, 
    wrapAsync(listingsController.createListings)
);


router
.route("/new")
.get(isLoggedIn,listingsController.renderNewForm);

router
.route("/search")
.get(
    isLoggedIn, 
    wrapAsync(listingsController.searchListings)
);
router
.route("/:id")
.get(wrapAsync(listingsController.showListings))
.put(
    isLoggedIn,
    isOwner, 
    upload.single('listing[image]'),
    validateListing, 
    wrapAsync(listingsController.updateListing)
)
.delete(
    isLoggedIn, 
    isOwner, wrapAsync(listingsController.destroyListings)
)

router
.route("/:id/edit")
.get(
    isLoggedIn, 
    isOwner, 
    wrapAsync(listingsController.renderEditForm)
);

// router
// .route("/search")
// .get(
//     isLoggedIn, 
//     wrapAsync(listingsController.searchListings)
// );







        


    

module.exports = router;