const express = require('express');
const mongoose = require('mongoose');
const Listing = require('./models/listing');
const path = require('path');
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/ExpressError.js');
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => console.log("Connection successfull"))
    .catch((err) => console.log(err));

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.get("/", (req, res) => {
    res.send("working");
});

const validateListing = (req, res, next) => {
     let {error}= listingSchema.validate(req.body);
     if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
       throw new ExpressError(400, errMsg);
     } else {
        next();
     }
};

const  validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};


// index route
app.get("/listings", wrapAsync( async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

// new route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

// show route
app.get("/listings/:id", wrapAsync( async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listing });
}));

// create route
app.post("/listings", validateListing, 
    wrapAsync( async (req, res, next) => {
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
}));

//edit route
app.get("/listings/:id/edit", wrapAsync( async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

// update route
app.put("/listings/:id", validateListing, wrapAsync( async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

// delete route
app.delete("/listings/:id", wrapAsync( async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    // console.log(deletedListing);
    res.redirect("/listings");
}));

// Reviews Post route
app.post("/listings/:id/reviews", validateReview, wrapAsync( async(req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
}));

// delete review route 
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async(req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}); // update listing by remvoing review that matches the id from array
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}))

// app.get("/testListing", async (req, res) => {
//     let sampleListing = new Listing({
//         title: "My home",
//         description: "welcome",
//         price: 1200,
//         location: "Kochi",
//         Country: "India",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("testing successful");
// });

// app.all("*", (req, res, next) => {
//     next(new ExpressError(404, "Page not found"));
// });


app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server is running on PORT: ${PORT}.`));