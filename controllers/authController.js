const {
  promisify
} = require("util");
const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const sendEmail = require("./../utils/email");
const crypto = require("crypto");
const catchAsyncError = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
const signToken = id => {
  return jwt.sign({
      id
    },
    process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    }
  );
};

// send token
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user
    }
  });
};

exports.signUp = catchAsyncError(async (req, res, next) => {

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role
  });
  // Create a json token
  const token = signToken(newUser._id);
  // Create cookies in safe manner
  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // secure: true,
    httpOnly: true
  });
  // user.password = undefined;
  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser
    }
  });

});

exports.login = async (req, res, next) => {
  const {
    email,
    password
  } = req.body;
  //check if email&password exists
  if (!email || !password) {
    // implement the error message here
    res.status(404).json({
      status: "fail"
    });
  }

  //check if user and password is correct
  // we use select here because we have use propery select false in mongoose client
  const user = await User.findOne({
    email
  }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    res.status(404).json({
      message: "Wrong email or password"
    });
  }
  // if user is correct send token to client
  createSendToken(user, 200, res);
};

exports.protectRoutes = async (req, res, next) => {
  // Getting token and check if its there

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // console.log(token);
  if (!token) {
    return next("You are not logged in");
  }
  // Vertify the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);
  // check if user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next("The user belonging to token doesnot exists");
  }

  // check if user has change password after token has issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next("User has changed password, Please login again");
  }
  req.user = freshUser;
  console.log(req.user.name);
  next();
};

// restparameter syntax
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next("You dont have access to it");
    }
    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  // Get user posted email
  const user = await User.findOne({
    email: req.body.email
  });
  if (!user) {
    next("Please provide email");
  }
  // Generate a token
  const resetToken = user.createPasswordResetToken();
  await user.save({
    validateBeforeSave: false
  });
  // Send it to user email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetpassword/${resetToken}`;
  const message = `forgot your password click on this link create new password to ${resetURL}`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token",
      message
    });
    res.status(200).json({
      status: "success",
      message: "Token sent to email"
    });
  } catch (error) {
    user.passWordResetToken = undefined;
    user.passWordResetExpires = undefined;
    await user.save({
      validateBeforeSave: false
    });
    console.log(error);
    return next("There is a problem with email config");
  }
};

exports.resetPassword = async (req, res, next) => {
  // get user based on token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passWordResetToken: hashedToken,
    passWordResetExpires: {
      $gt: Date.now()
    }
  });
  // if token is valid set new password
  if (!user) {
    return next("Token is invalid or expired");
  }
  (user.password = req.body.password),
  (user.passwordConfirm = req.body.passwordConfirm),
  (user.passWordResetToken = undefined);
  user.passWordResetExpires = undefined;
  await user.save();
  // update change password for user

  // log the user in
  createSendToken(user, 200, res);
};
// only for rendered pages
exports.isLoggedIn = async (req, res, next) => {
  // Getting token and check if its there
  try {
    if (req.cookies.jwt) {
      // Vertify the token
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
      // console.log(decoded);
      // check if user still exists
      const freshUser = await User.findById(decoded.id);
      if (!freshUser) {
        return next();
      }

      // check if user has change password after token has issued
      if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      res.locals.user = freshUser;
      // console.log(req.user.name);
      return next();
    }
    return next();
  } catch (err) {
    return next();
  }


};
exports.logOut = (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(
      Date.now() + 10 * 1000
    ),
    httpOnly: true
  });
  res.status(200).json({
    status: 'success'
  });
}