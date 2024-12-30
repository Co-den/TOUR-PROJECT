//review/ratings/createdAt/ref to tour / ref to user
const mongoose = require('mongoose');
const Tour = require('./tourModel');


const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        tequired: [true, 'Review must not be empty']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']
    }

}, {
    //schema options
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

//POPULATING DOCUMENTS
reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name photo'
    });
    next();
});


reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        }
        ,
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    console.log(stats);
    //the tourid and the data we want to update
    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating

        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5

        });
    }

};

reviewSchema.post('save', function () {
    //this points to the current review model
    this.constructor.calcAverageRatings(this.tour);
});

//findOneAndUpdaate
//findOneAndDelete
reviewSchema.pre('/^findOneAnd/', async function (next) {
    //this points to the current review model
    this.r = await this.fineOne();
    next();
});




const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;