const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const shopSchema = new mongoose.Schema({
	shopname: {
		type: String,
		trim: true,
		required: 'Please enter a shop name!'
	},
	location: {
		type: {
			type: String,
			default: 'Point'
		},
		coordinates: [{
			type: Number,
			required: 'You must supply coordiantes!'
		}],
		address: {
			type: String,
			required: 'You must supply an address!'
		}
	},
	slug: String,
	email: String,
	phone: String,
	shopdescription: {
		type: String,	
		trim: true
	},
	shoptype: String,
	datecreated: {
		type: Date,
		default: Date.now
	},
	photo: String,
	// below connect user who create the store 
	author: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: 'You must supply an author'
	}
});

// Define our index
shopSchema.index({
	shopname: 'text',
	shopdescription: 'text'
})

shopSchema.pre('save', async function(next){
	if (!this.isModified('shopname')){
		next();
		return;
	}
	this.slug = slug(this.shopname);
	// find other shop that the same slug name and then add a -n on the end of the shop name
	const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
	const shopWithSlug = await this.constructor.find({ slug: slugRegEx });
	if(shopWithSlug.length) {
		this.slug = `${this.slug}-${shopWithSlug.length + 1}`;
	}
	next();
});

module.exports = mongoose.model('Shop', shopSchema);