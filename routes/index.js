const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const staticPageController = require('../controllers/staticPageController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');

// home route
router.get('/', catchErrors(staticPageController.homepage));

// shop route
router.get('/shop', catchErrors(shopController.getShops));
router.get('/shop/:slug', catchErrors(shopController.getShopBySlug));

// edit a shop route
router.get('/shop/:id/edit', catchErrors(shopController.editShop)); //:id is a params that we can use to create a specific name for our single shop
// router.post('/shop', function(req, res){
// 	console.log(req.body.shopname);
// })

// about route
router.get('/about', staticPageController.aboutPage);

// contact route
router.get('/contact', staticPageController.contactPage);

// new-shop route
router.get('/new-shop', authController.isLoggedIn, shopController.newShopPage);
router.post('/new-shop', 
	shopController.upload, 
	catchErrors(shopController.resize), 
	catchErrors(shopController.createShop)
);
router.post('/new-shop/:id', 
	shopController.upload, 
	catchErrors(shopController.resize), 
	catchErrors(shopController.updateShop)
);

// user login and registeration
router.get('/login', userController.loginForm);
router.post('/login', authController.login);
router.get('/register', userController.registerForm);

//1.validate registeration data
//2. register the user
//3 . we need to login them directly
router.post('/register', 
	userController.validateRegister,
	catchErrors(userController.registerUser),
	authController.login
);

router.get('/logout', authController.logout);

// User profile route
router.get('/account', authController.isLoggedIn, userController.userDetails);
router.post('/account', catchErrors(userController.updateUserDetails));

//forgot password
router.get('/forgotPassword', userController.forgotPassword);
router.post('/account/forgot', authController.forgot);
router.get('/account/forgot/:token', catchErrors(authController.reset));
router.post('/account/forgot/:token', 
	authController.confirmPasswords, 
	catchErrors(authController.updatePassword) );

/*
	API
*/

router.get('/api/search', catchErrors(shopController.searchShops));

module.exports = router;