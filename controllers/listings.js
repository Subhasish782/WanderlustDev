const Listing= require('../models/listing');

const categoryMap = {
    "Trending": "trending",
    "Rooms": "rooms",
    "Iconic Cities": "iconic-cities",
    "Castles": "castles",
    "Amazing Pools": "pools",
    "Camping": "camping",
    "Farms": "farms",
    "Arctic": "arctic",
    "Domes": "domes",
    "Boats": "boats"
};

module.exports.index = async (req, res) => {
    const { category } = req.query;
    let allListings;
    if (category) {
        const dbCategory = categoryMap[category] || category;
        allListings = await Listing.find({ category: dbCategory });
        // Optional: handle invalid category
        if (!Object.keys(categoryMap).includes(category)) {
            req.flash("error", "Invalid category selected.");
            return res.redirect("/listings");
        }
    } else {
        allListings = await Listing.find({});
    }
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm= (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListings=(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            }
        })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
});

module.exports.createListings=(async (req, res) => {
    let url=req.file.path;
    let filename=req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image={url,filename};
    await newListing.save();
    req.flash("success", "New listing created!");
    res.redirect("/listings")
});

module.exports.renderEditForm=(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing, error: null });
});

module.exports.updateListing = async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if(typeof req.file !== "undefined") {
        let url = req.file.path; 
        let filename = req.file.filename;  
        listing.image = { url, filename }; 
        await listing.save();    
    }
    req.flash("success","Listing Updated!!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListings=async (req, res) => {
    const { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing deleted!");
    res.redirect("/listings");
};

module.exports.searchListings = async (req, res) => {
    try {
        const query = req.query.q || '';
        const priceQuery = Number(query);

        let searchConditions = [];
        if (query.trim() !== '') {
            searchConditions = [
                { title: { $regex: query, $options: 'i' } },
                { location: { $regex: query, $options: 'i' } },
                { country: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ];
        }
        // Only add price search if query is a valid number
        if (!isNaN(priceQuery) && query.trim() !== '') {
            searchConditions.push({ price: priceQuery });
        }

        // If no valid search conditions, return all listings
        const allListings = searchConditions.length > 0
            ? await Listing.find({ $or: searchConditions })
            : await Listing.find({});

        if (allListings.length === 0) {
            req.flash("error", "No listings found for your search.");
        }

        res.render('listings/index', { allListings });
    } catch (err) {
        console.error("Search Listings Error:", err);
        req.flash("error", "An error occurred while searching for listings. Please try again.");
        res.redirect("/listings");
    }
};