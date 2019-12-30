const AppError = require("../utils/appError");
const handleValidateErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `${errors.join(". ")}`;
  return new AppError(message, 400);
};
// const MongoErrorDB = err => {
//     const errors = Object.values(err.errors).map(el => el.message);

//     const message = `Invalid input data. ${errors.join('. ')}`;
//     return new AppError(message, 400);
// }
const sendErrDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    err: err,
    stack: err.stack
  });
};
const sendErrProd = (err, res) => {
  // opeartional trusted error message send to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
    // Unknown error no details send to be client
  } else {
    // lofg the error
    console.error("ERR ", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong"
    });
  }
};

module.exports = (err, req, res, next) => {
  err.status = err.status || "error";
  err.statusCode = err.statusCode || 500;
  if (process.env.NODE_ENV === "development") {
    sendErrDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    // destructuring
    let error = {
      ...err
    };
    if (error.name === "ValidationError") error = handleValidateErrorDB(error);
    sendErrProd(error, res);
  }
};
