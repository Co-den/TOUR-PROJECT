const mongoose = require('mongoose');
const slugify = require('slugify');
//const User = require('./userModel')


const tourSchema = new mongoose.Schema({
    //schema objects
    name: {
        type: String,
        required: [true, "A tour must have a name"],
        unique: true,
        trim: true,
        maxLength: [40, 'A tour name must have less or equal to 40 characters'],
        minLength: [10, 'A tour have must have less or equal to 10 characters']
    },
    //new
    slug: String,
    duration: {
        type: Number,
        required: [true, "A tour must require a durationn"]
    },
    maxGroupSize: {
        type: Number,
        required: [true, "A tour must have maxGroiupSize"]
    },
    difficulty: {
        type: String,
        required: [true, "A tour must have a difficulty"],
        enum: {
            values: ['easy', 'medium', 'hard', 'difficult'],
            message: 'Difficulty is either: easy, medium, hard, difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.9,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, "A tour must have a price"]
    },
    priceDiscount: {
        type: Number,
        validate: {
            //this only points to current doc on NEW document creation
            validator: function (val) {
                return val < this.price
            },
            message: 'Discount price({VALUE}) shoule be below regular price'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, "A tour must have a description"]
    },
    description: {
        type: String,
        trime: true
    },
    imageCover: {
        type: String,
        required: [true, "A tour must have a cover image"]
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    //new
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        //Geospatial-JSON
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ],

},
    {
        //schema options
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    });


//INDEXES
//tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
//VIRTUAL PROPERTIES
//basically fields we can define on our schema but it wont
//be saved on our DB
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7
});

//virtual populate
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
})

//DOCUMENT MIDDLEWARE: runs before .save() and .create();
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});
tourSchema.post('save', function (doc, next) {
    console.log(doc);
    next();
});

//QUERY MIDDLEWARE: allows us to run functions before or after
//a query is executed
/*tourSchema.pre('save', async function (next) {
    const guidesPromise = this.guides.map(async id => await User.findById(id))
    this.guides = await Promise.all(guidesPromise);
    next();
});*/


tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });
    this.start = Date.now();
    next();
});

tourSchema.post(/^find/, function (doc, next) {
    console.log(`Query took ${Date.now() - this.start}milliseconds`);
    next();
});
//POPULATING DOCUMENTS
tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    })
    next()
});
//AGGREGATION MIDDLEWARE:
tourSchema.pre('aggregate', function (next) {
    //unshift is for adding an element at the begining of an array
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    console.log(this.pipeline());
    next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
