const Tour = require('../model/tourModel');
const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError')



exports.getOverView = catchAsync(async (req, res, next) => {
    //1) GET OUR TOUR FROM COLLECTION  
    const tours = await Tour.find()

    //2) BUILD TEMPLATE

    //3) RENDER THE TEMPLATE USING OUR TOUR DATA FROM ABOVE
    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    });
});


exports.getTour = catchAsync(async (req, res, next) => {
    //1) GET THE DATA, FOR THE REQUESTED TOUR (INCLUDING REVIEWS AND GUIDES);
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });
    
    if(!tour){
        return next(new AppError('There is no Tour with that name.', 404))
    }

    //2)Build template

    //3)Render the template using data
    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour
    });
});


exports.loginForm = catchAsync(async (req, res, next) => {
    res.status(200).render('login', {
        title: 'Log into your account',
    });
});