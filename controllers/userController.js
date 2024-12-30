const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');



const filterObj = (obj, ...allowedFields) => {
    //loop through the obj and for each element check if its one of the allowed fields
    const newObj = {}
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) { newObj[el] = obj[el]; }
    });
    return newObj;
};


//ENPOINT MIDDLEWARE: allows users get personal data
exports.getCurrentUser = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};



//UPDATING CURRENT USER
exports.updateUser = catchAsync(async (req, res, next) => {
    //1) create error if user post password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError('this route is not for password upadtes. please use /updatePassword', 400)
        )
    }
    //2)filtered out unwanted field names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email');

    //3)update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    })
    //4) send response
    res.status(200).json({
        status: "success",
        data: {
            user: updatedUser
        }
    });
    
});




//GETTING ALL USERS
exports.getAllUser = factory.getAll(User);

//GETTING SINGLE USER
exports.getUser = factory.getOne(User);

//DELETE 
exports.deleteUser = factory.deleteOne(User);

