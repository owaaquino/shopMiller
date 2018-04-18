const mongoose = require('mongoose');
const Shop = mongoose.model('Shop');


exports.homepage = async (req, res) => {
	const shops = await Shop.find();
	// console.log(shops);
	res.render('index', {	title: 'Home', shops: shops });
}

exports.aboutPage = (req, res) => {
    res.render('about', {
		title: 'About'

	});
}

exports.contactPage = (req, res) => {
    res.render('contact', {
		title: 'Contact'
	});
}