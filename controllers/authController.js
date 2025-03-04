const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');




//TOKEN
const signToken = id => jwt.sign({ id },
    process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);



    //COOKIES
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);
    //REMOVE PASSOWRD FROM OUTPUT
    user.password = undefined;
    res.status(statusCode).json({
        status: "Success",
        token,
        data: { user }
    });
}



//Create new User
//SIGNING UP USERS
exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);
    createSendToken(newUser, 201, res);

});



//LOGGING IN USER
exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    //1)check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }

    //2)check if user exist and password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user?.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    //3)if everything is okay, send token to client
    createSendToken(user, 200, res);
    next();
});




exports.logout = catchAsync(async(req, res, next)=>{
res.cookie('jwt', 'logout',{
    expires: new Date(Date.now() +10 * 1000),
    httpOnly: true
      });
   res.status(200).json({status:'success'});
});




exports.protect = catchAsync(async (req, res, next) => {
    //1) getting token and checking if its there
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    };

    if (!token) {
        return next(
            new AppError(
                'You are not logged in!, please login to get access.',
                401));
    }

    //2) verification of token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);


    //3) check if user still exist
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(
            new AppError(
                'The token belonging to this user no longer exist.',
                401
            )
        );
    }

    //4) check if user changed password after token was issued
    if (currentUser.changedPasswordAfterToken(decoded.iat)) {
        return next(
            new AppError(
                'User recently changed password please log in again',
                401
            )
        )
    };

    //GRANT ACCESS TO PROTECTED ROUTE;
    req.user = currentUser;
    next();
});




exports.isLoggedIn = catchAsync(async (req, res, next) => {

        if (req.cookies.jwt) {
       
           try{
           //1) verification of token
           const decoded = await promisify(jwt.verify)(
               req.cookies.jwt,
               process.env.JWT_SECRET
           );
       
           //2) check if user still exist
           const currentUser = await User.findById(decoded.id);
           if (!currentUser) {
               return next();
           }
       
           //3) check if user changed password after token was issued
           if (currentUser.changedPasswordAfterToken(decoded.iat)) {
               return next()
           };
       
           //THERE IS A LOGGED IN USER ;
           res.locals.user = currentUser;
           return next();
           }catch(err){
               return next();
           }
         }
       
           next();
       });





//allowing users with certain roles gain access
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // Check if user role is included in the allowed roles array
        if (!req.user || !roles.includes(req.user.role)) {
            // If user role is not included, return
            return next(new AppError('You do not have permission to perform this action', 403));
        }

        // If user role is included, proceed to the next middleware
        next();
    };
};




//password reset
exports.forgotPassword = catchAsync(async (req, res, next) => {
    //1) get user based on posted email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with this email address', 404));
    }

    //2) Generate a random reset token
    const resetToken = user.passwordResetToken; // Assuming you have a method to generate the token in your user model

    //3) Save the user with the new reset token and expiration time
    await user.save({ validateBeforeSave: false });

    //4) Construct reset URL using hashed token
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/resetPassword/${resetToken}`;

    //5) Format message string without leading/trailing spaces
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetUrl}. If you didn't forget your password, please ignore this email.`;

    try {
        // Send email with the reset token URL
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            resetUrl,
            message
        });

        res.status(200).json({
            status: "success",
            message: 'Token sent to email!'
        });


    } catch (err) {
        // Log error or provide more detailed error messages
        console.error('Error sending email:', err);

        // Clear reset token and expiration time on error
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError('There was an error sending the email. Please try again later.', 500));
    }
    next();
});




exports.resetPassword = catchAsync(async (req, res, next) => {
    //1) get user based on the token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex')

    const user = await User.findOne({
        passwordResetToken:
            hashedToken, passwordResetExpires:
            { $gt: Date.now() }
    });

    //2) if token has not expired, and there is user, set the new password
    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save()

    //3) update changedpasswordAt property for the user

    //4) log the user in, send JWT token
    createSendToken(user, 200, res);
    next();
});




exports.updatePassword = catchAsync(async (req, res, next) => {
    //1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    //2) check if POSTED current password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Your password is wrong!', 404))
    }
    //3) if so update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    //4) log user in, send JWT 
    createSendToken(user, 200, res);

    next();
});

