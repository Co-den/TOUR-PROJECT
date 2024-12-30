const express = require('express');
const viewsController = require('../controllers/viewsController');
const authContoller = require('../controllers/authController');


const router = express.Router();


router.use(authContoller.isLoggedIn);


// Route for rendering the homepage using Pug template
router.get('/', viewsController.getOverView);

router.get('/tour/:slug', viewsController.getTour);

router.get('/login', viewsController.loginForm);



module.exports = router