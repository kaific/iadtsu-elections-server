const { User, PendingUser } = require("../models/auth.model");
const expressJwt = require("express-jwt");

exports.readController = (req, res) => {
  const userId = req.params.id;
  User.findById(userId).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }
    user.hashed_password = undefined;
    user.salt = undefined;
    res.json(user);
  });
};

exports.readAllController = (req, res) => {
  User.find(
    {},
    "_id role first_name _last_name pref_first_name student_number createdAt updatedAt",
    (err, users) => {
      if (err) {
        console.log(err);
        return res.status(400).json({
          success: false,
          message: err,
        });
      }

      return res.json(users);
    }
  );
};

// Get accounts currently pending activation
exports.readPendingController = (req, res) => {
  PendingUser.find((err, pendingUsers) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: "No pending users found.",
      });
    }

    return res.json(pendingUsers);
  });
};

exports.updateController = (req, res) => {
  // console.log('UPDATE USER - req.user', req.user, 'UPDATE DATA', req.body);
  const { first_name, last_name, pref_first_name, password } = req.body;

  User.findOne({ _id: req.user._id }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }
    if (!first_name) {
      return res.status(400).json({
        error: "First name is required",
      });
    } else {
      user.first_name = first_name;
    }
    if (!last_name) {
      return res.status(400).json({
        error: "Last name is required",
      });
    } else {
      user.last_name = last_name;
    }
    if (!pref_first_name) {
      return res.status(400).json({
        error: "Preferred first name is required",
      });
    } else {
      user.pref_first_name = pref_first_name;
    }
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          error: "Password should be min 6 characters long",
        });
      } else {
        user.password = password;
      }
    }

    user.save((err, updatedUser) => {
      if (err) {
        console.log("USER UPDATE ERROR", err);
        return res.status(400).json({
          error: "User update failed",
        });
      }
      updatedUser.hashed_password = undefined;
      updatedUser.salt = undefined;
      res.json(updatedUser);
    });
  });
};

// exports.deleteController = (req, res) => {
//   const id = req.params.id;
//   User.findOneAndDelete({ _id: id }, (err, deletedUser) => {
//     if (err || !deletedUser) {
//       res.status(400).json({
//         error: "Could not delete user.",
//         success: false,
//       });
//     }

//     res.json({ success: true, deletedUser });
//   });
// };

// exports.deleteAllController = (req, res) => {
//   User.deleteMany({}, (err, deletedUsers) => {
//     if (err) {
//       res.status(400).json({
//         error: "Wha",
//         success: false,
//       });
//     }
//   });
// };
