/* eslint-disable no-unused-vars */
const path = require('path')
const express = require('express');
const app = express();
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const crypto = require('crypto')



//error handlers
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');


//route handlers
const viewRouter = require('./routes/viewRoutes');
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');
const reviewRouter = require('./routes/reviewRoutes');


app.set('view engine', 'pug');

app.set('views', path.join(__dirname, 'views'));

// Serving static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));



//1)GLOBAL MIDDLEWARE

//Set security HTTP headers
app.use(helmet());


//Development login
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

//limit request from some APIs
const apiLimiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many request from this IP, please try again later'
});

app.use('/api/', apiLimiter);


//Body parser, reading data from the body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser())

// Data Sanitization from noSQL query injection
app.use(mongoSanitize());


//Data sanitization against 
app.use(xss());


//preventing parameter pollution
app.use(hpp({
    whitelist: [
        "duration",
        "price",
        "difficulty"
    ]
}));


//Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    console.log(req.cookies);
    next();
});

  

//MOUNTING OUR ROUTERS
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);


//NON EXISTING ROUTES
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`));
});



//TO ALL OTHER CONTENT-TYPE FROM OTHER SOURCES OUTSIDE OUR BROWSER
app.use((req, res, next) => {
    const nonce = crypto.randomBytes(16).toString('base64'); // Generate nonce
    res.locals.nonce = nonce; 
// Add CSP header with the nonce
      res.setHeader(
    'Content-Security-Policy',
    `script-src 'self' https://cdn.jsdelivr.net 'nonce-${nonce}';`
  );
  next();
});

//CENTRAL MIDDLEWARE FOR ALL ERRORS
app.use(globalErrorHandler);

module.exports = app;