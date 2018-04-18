const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');


// user login using passport module
exports.login = passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: 'Failed Login',
    successRedirect: '/',
    successFlash: 'You are now logged in!'
});

//clicking logout button and terminating user 
exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'You are now logged out!');
    res.redirect('/');
}

// middle ware: check if user is logged in or not
exports.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        next();
        return;
    }
    req.flash('error', 'You must be logged in to add a shop!');
    res.redirect('/login');
}


// password reset flow
exports.forgot = async (req, res) => {
    //1. See if that user exists
    const user = await User.findOne({ email: req.body.email });
    if (!user){
        req.flash('error', 'No account with that email exists.');
        return res.redirect('/forgotPassword');
    }
    //2. Set reset tokens and expiry on their account
    user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordExpires = Date.now() + 3600000; //1 hr from now
    await user.save();

    //3. Send email with password token
    const resetUrl = `http://${req.headers.host}/account/forgot/${user.resetPasswordToken}`;
    req.flash('success', `You have been emailed a password reset link ${resetUrl}`);
    //4. redirect to login page
    res.redirect('/login');
}

exports.reset = async (req, res) => {
    // check if any user has the token and check if it is expires or not
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });
    if(!user) {
        req.flash('error', 'Password token is expired or invalid!');
        res.return('/login');
    }
    // if there is a user, show the reset password form
    res.render('reset', {title: 'Reset your password'});
    await setPassword(req.body.password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    const updatedUser = await User.save();
    await req.login(updatedUser);
    req.flash('success', 'Your password has been reset!');
    res.redirect('/');
};

exports.confirmPasswords = (req, res, next) => {
    if (req.body.password === req.body['confirm-password']){
        next();
        return;
    }
    req.flash('error', 'Password not matched');
    res.redirect('back');
};

exports.updatePassword = async (req, res) => {
    //find the user and make sure the token is not expired
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });
    if(!user) {
        req.flash('error', 'Password token is expired or invalid!');
        res.return('/login');
    }

    const setPassword = promisify(user.setPassword, user);
    await setPassword(req.body.password);   
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    const userUpdated = await user.save();
    await req.login(userUpdated);
    req.flash('success', 'Your password has been changed!')
    res.redirect('/');
};