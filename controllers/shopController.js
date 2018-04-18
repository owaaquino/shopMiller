const mongoose = require('mongoose');
const Shop = mongoose.model('Shop');
const multer = require('multer'); // middle ware for enhancing images upload
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
	storage: multer.memoryStorage(),
	fileFilter: function(req, file, next) {
		const isPhoto = file.mimetype.startsWith('image/');
		if(isPhoto){
			next(null, true);
		} else {
			next({message: 'That file type is not allowed!'}, false)
		}
	}
}

exports.newShopPage = (req, res) => {
	res.render('new-shop', {
		title: 'Add New Shop'
	});
}

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
	// check if tehre is no file to resize
	if(!req.file) {
		next(); //skipp to the next middleware
		return;
	}
	const extension = req.file.mimetype.split('/')[1];
	req.body.photo = `${uuid.v4()}.${extension}`;
	// now we resize
	const photo = await jimp.read(req.file.buffer);
	await photo.resize(800, jimp.AUTO);
	await photo.write(`./public/uploads/${req.body.photo}`);
	//once we have written the photo to our filesystem, keep going!
	next();
}

exports.createShop = async (req, res) => {
	// res.json(req.body);
	req.body.author = req.user._id; 
	const shop = new Shop(req.body);
	await shop.save();
	req.flash('success', `Successfully Created ${shop.shopname}`);
	res.redirect('/shop');
};

exports.getShops = async (req, res ) => {
	// 1. query the db for a list of all stores
	const shops = await Shop.find();
	console.log(shops);
	res.render('shop', {
		title: 'Shop', shops: shops
	});
};

exports.editShop = async (req, res) => {
	//1. find shop given the id
	const shop = await Shop.findOne({ _id: req.params.id }); // pull the details of the store by id
	
	//2. confirm they are the owner of the shop
	//3. render out edit form so user can update.
	res.render('editShop', { title: `Edit ${shop.shopname}`, shop });
}

exports.updateShop = async (req, res) => {
	//find and update the shop
	const shop = await Shop.findOneAndUpdate({ _id: req.params.id }, req.body, {
		new: true, //return the new shop insteaed of the old one
		runValidators: true
	}).exec();
	req.flash('success', `Successfully updated ${shop.shopname}, <a href="/shop/${shop.slug}">View Shop</a>`)
	//redirect the shoop page 
	res.redirect(`/shop/${shop.id}/edit`);
}

exports.getShopBySlug = async (req, res, next) => {
	const shop = await Shop.findOne({ slug: req.params.slug }); // pull the details of the store by slug
	if (!shop) return next();
	res.render('single-shop', { shop, title: shop.shopname });
}	

exports.searchShops = async (req, res, next) => {
	const shops = await Shop
	// find the shop that match
	.find({
		$text: {
			$search: req.query.q
		}
	}, {
		score: { $meta: 'textScore' }
	})
	// sort the shop by score 
	.sort({
		score: { $meta: 'textScore' }
	})
	// limit result to 5 shops
	.limit(5);
	res.json( shops )
}