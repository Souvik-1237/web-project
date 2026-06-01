const Listing = require('../models/listing');


module.exports.index = async (req,res) => {
    const alllisting = await Listing.find({});
    res.render("listings/index", { alllisting });
};

module.exports.renderNewForm = (req,res) => {
    
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req,res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({path: "reviews",
    populate: {
        path: "author"
    }
})
    .populate("owner");
    if(!listing){
        req.flash("error", "Cannot find that listing!");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show", { listing });
};

module.exports.createListing = async (req,res,next) => {
const newlisting = new Listing(req.body.listing);
  newlisting.owner = req.user._id;
  await newlisting.save();
  req.flash("success", "Successfully created a new listing!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req,res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit", { listing });
};

module.exports.updateListing = async (req,res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Successfully updated the listing!");
    res.redirect("/listings");
};

module.exports.destroyListing = async (req,res) => {
    let { id } = req.params;
   let deletedListing = await Listing.findByIdAndDelete(id);
   console.log( deletedListing);
   req.flash("success", "listing deleted!");
    res.redirect("/listings");
};