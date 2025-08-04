const express = require('express');
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");
const router = express.Router({mergeParams: true});
const reviewController = require("../controllers/reviews.js");





// Reviews Post route
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

// delete review route 
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;