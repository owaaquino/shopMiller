const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

//goes to login form
exports.loginForm = (req, res) =>{
    res.render('login', { title: 'Login' });
}

//goes to register form
exports.registerForm = (req, res) => {
    res.render('register', { title: 'Register' } );
};

// middle ware to validate Register Form
exports.validateRegister = (req, res, next ) => {
    req.sanitizeBody('name');
    req.checkBody('name', 'You must supply a name!').notEmpty();
    req.checkBody('email', 'That Email is not Valid!').isEmail();
    req.sanitizeBody('email').normalizeEmail({
        remove_dots: false,
        remove_extension: false,
        gmail_remove_subaddress: false
    });
    req.checkBody('password', 'Password Cannot be Blank!').notEmpty();
    req.checkBody('password-confirm', 'Confirmed Password cannot be blank').notEmpty();
    req.checkBody('password-confirm', 'Your password do not match!').equals(req.body.password);

    const errors = req.validationErrors();
    if (errors) {
        req.flash('error', errors.map(err => err.msg));
        res.render('register', { title: 'Register', body: req.body, flashes: req.flash() });
        return; // stop the fn from running 
    }
    next(); //there were no errors!
};

//finally after validation if correct details register user
exports.registerUser = async (req, res, next) => {
    const user = new User({ email: req.body.email, name: req.body.name });
    const register = promisify(User.register, User);
    await register(user, req.body.password);  
    next(); // pass to authController.login
};

//clicking the My Account in nav 
exports.userDetails = (req, res) => {
    res.render('userDetail', { title: "Edit Your Account" })
};

// updates my account details email and name.
exports.updateUserDetails = async (req, res) => {
    const updates = {
        name: req.body.name,
        email: req.body.email
    };

    const user = await User.findOneAndUpdate(
        { _id: req.user._id },
        { $set: updates },
        { new: true, runValidators: true, context: 'query' }
    );
    req.flash('success', 'Updated the profile!');
    res.redirect('back'); //same as going back to account url
};

// forgot password
exports.forgotPassword = async (req, res) => {
    res.render('forgotPassword', {title: 'Reset Password'});
}