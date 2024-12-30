const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');



const router = express.Router();


//signup and login routes
router.post('/signup', authController.signup);

router.post('/login', authController.login);

router.get('/logout', authController.logout);


//forgotpassword and reset password routes
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);


router.use(authController.protect);
router.patch('/updatePassword',authController.updatePassword);

//update user data
router.get('/me',userController.getCurrentUser,userController.getUser);

router.patch('/updateUser',userController.updateUser);

router.delete('/deleteUser',userController.deleteUser);

//getting users route
router.route('/').get(userController.getAllUser)


//getting single user route
router.route('/:id').get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);




module.exports = router;





