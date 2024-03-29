const mongoose = require("mongoose");
const crypto = require("crypto");

// User Schema
const userSchema = new mongoose.Schema(
  {
    student_number: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
    },
    first_name: {
      type: String,
      trim: true,
      required: true,
    },
    last_name: {
      type: String,
      trim: true,
      required: true,
    },
    pref_first_name: {
      type: String,
      trim: true,
      required: true,
    },
    hashed_password: {
      // save as hash after encrypting
      type: String,
      required: true,
    },
    salt: String,
    role: {
      type: String,
      default: "normal",
      // two more (normal, admin...)
    },
    resetPasswordLink: {
      data: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Virtual Password
userSchema
  .virtual("password")
  .set(function (password) {
    // set password note you must use normal function not arrow function
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

// methods
userSchema.methods = {
  // Generate Salt
  makeSalt: function () {
    return Math.round(new Date().valueOf() * Math.random()) + "";
  },
  // Encrypt Password
  encryptPassword: function (password) {
    if (!password) return "";
    try {
      return crypto
        .createHmac("sha1", this.salt)
        .update(password)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },
  // Compare password between plain get from user and hashed
  authenticate: function (plainPassword) {
    return this.encryptPassword(plainPassword) === this.hashed_password;
  },
};

const pendingUserSchema = new mongoose.Schema(
  {
    student_number: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
    },
    first_name: {
      type: String,
      trim: true,
      required: true,
    },
    last_name: {
      type: String,
      trim: true,
      required: true,
    },
    pref_first_name: {
      type: String,
      trim: true,
      required: true,
    },
    activationToken: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

pendingUserSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = {
  User: mongoose.model("User", userSchema),
  PendingUser: mongoose.model("PendingUser", pendingUserSchema),
};
