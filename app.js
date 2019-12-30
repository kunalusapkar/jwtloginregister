const path = require("path");
const express = require("express");
const errorController = require('./controllers/errorController');
var exphbs = require("express-handlebars");
const app = express();
const userRoute = require("./routes/userRoutes");
const tourRoute = require("./routes/tourRoute");
const viewRoutes = require("./routes/viewRoutes");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const AppError = require('./utils/appError');


// Set Security http header
app.use(helmet());
app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");
app.use(express.static(path.join(__dirname, "public")));
app.use(
  express.json({
    limit: "10kb"
  })
);
app.use(cookieParser());
// limit request
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many request from your ip"
});

app.use("/api", limiter);

app.use((req, res, next) => {
  console.log(req.headers);
  next();
});
app.use((req, res, next) => {
  // console.log(req.cookies);
  // console.log(req.user);
  next();
});
app.use("/api/v1/users", userRoute);
app.use("/api/v1/tours", tourRoute);
app.use("/", viewRoutes);

app.all("*", (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Cannot find ${req.originalUrl}`
  // });
  // const err = new Error(`Cannot find ${req.originalUrl}`);
  // err.statusCode = 404;
  // err.status = 'fail',
  next(new AppError(`Cannot find ${req.originalUrl}`, 404));
});

app.use(errorController);

module.exports = app;