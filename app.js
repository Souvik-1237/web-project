require("dotenv").config();
console.log(process.env.SECRET);


const express= require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require ("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").MongoStore;
const flash = require("connect-flash");
const wrapAsync = require ("./utils/wrapAsync.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter= require("./routes/review.js");
const userRouter= require("./routes/user.js");

 const dbUrl = process.env.ATLASDB_URL ;



main()
 .then(() => {
    console.log ("connected to DB");
})
 .catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));


 
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret : process.env.SECRET,
    },
    touchAfter: 24 * 60 * 60,
});
      
store.on("error", function(e){
    console.log("Session store error", e);
});

const sessionOptions = {
    store: store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie : {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
};
  
app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req,res) =>{
    res.redirect("/listings");
});

app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
});




// app.get("/demouser", async (req,res) => {
//   let fakeuser = new User({
//     email: "demo@gmail.com",
//     username: "demo",
//     });

//    let registeredUser = await User.register(fakeuser, "demopassword");
//    res.send(registeredUser);

// });

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);



app.use((err, req, res, next) => {
   const { statusCode=500, message="Something went wrong" } = err;
    res.status(statusCode).render("error.ejs",{message});
});
    

app.listen(8000,() =>{
    console.log("server is listening to port 8000");
});


