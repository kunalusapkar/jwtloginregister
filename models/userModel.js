const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A user must have name"]
  },
  email: {
    type: String,
    required: [true, "A user must have email"],
    lowercase: true,
    unique: true,
    validate: {
      validator: function (el) {
        return this.unique === false
      },
      message: "Email is already registered"
    }
  },
  password: {
    type: String,
    required: [true, "A user must have pasword"],
    minlength: 8,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm the password again"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Password are not same"
    }
  },
  passwordChangedAt: Date,
  passWordResetToken: String,
  passWordResetExpires: Date
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre("save", async function (next) {
  // only run the password if there is any password to be changed
  if (!this.isModified("password")) return next();
  // Hash the password
  this.password = await bcrypt.hash(this.password, 12);
  // Delete the confirmpassword field
  this.passwordConfirm = undefined;
  next();
});

// for checking correct passwoed or not
userSchema.methods.correctPassword = async function (requestedPassword, userPassword) {
  return await bcrypt.compare(requestedPassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp; //100<200
  }
  // false means not changed
  return false;
}

// creating password token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passWordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  console.log({
    resetToken
  }, this.passWordResetToken);
  this.passWordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
}




const User = mongoose.model("User", userSchema);

module.exports = User;