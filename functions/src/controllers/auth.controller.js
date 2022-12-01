const User = require("../models/auth.model");
const expressJwt = require("express-jwt");
const _ = require("lodash");
// const fetch = require("node-fetch");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

// Custom error handler to get useful database error messages
const { errorHandler } = require("../helpers/dbErrorHandling");

// Email client
const oAuth2Client = new google.auth.OAuth2(
  process.env.AUTH_CLIENT_ID,
  process.env.AUTH_CLIENT_SECRET,
  process.env.AUTH_REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: process.env.AUTH_REFRESH_TOKEN });

// Nodemailer send function
async function sendMail(mailOptions) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "noreply.iadtsu@gmail.com",
        clientId: process.env.AUTH_CLIENT_ID,
        clientSecret: process.env.AUTH_CLIENT_SECRET,
        refreshToken: process.env.AUTH_REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    return error;
  }
}

exports.registerController = (req, res) => {
  const { first_name, last_name, student_number, pref_first_name, password } =
    req.body;
  const errors = validationResult(req);

  // Validation for req.body
  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      success: false,
      error: firstError,
    });
  } else {
    User.findOne({
      student_number,
    }).exec(async (err, user) => {
      // If user is already registered

      if (err) {
        return res
          .status(400)
          .json({ success: false, error: err.message.data });
      }
      if (user) {
        return await res.status(400).json({
          success: false,
          error: "Account already exists.",
        });
      }
      // If user isn't already registered
      else {
        // Generate Token
        const token = jwt.sign(
          {
            first_name,
            last_name,
            student_number,
            pref_first_name,
            password,
          },
          process.env.JWT_ACCOUNT_ACTIVATION,
          {
            expiresIn: "1440m",
          }
        );

        const mailOptions = {
          from: `IADT SU <${process.env.EMAIL_FROM}>`,
          to: `${student_number}@iadt.ie`,
          subject: `IADTSU Elections Account Activation Link`,
          text: `Hello, Thank you for registering to vote in IADTSU Elections. Go to the following link to complete your registration: ${process.env.CLIENT_URL}/users/activate/${token}. This activation link will expire in 15 minutes. Please fill out the registration form again if you miss this timeframe.`,
          html: `
          <html>
          <body>
          <p>Hello ${first_name},</p>
          <p>Thank you for registering to vote in IADTSU Elections. Go to the following link to complete your registration:</p>
          <hr/>
          <p>${process.env.CLIENT_URL}/users/activate/${token}</p>
          <hr/>
          <p>This activation link will expire in 24h. Please fill out the registration form again if you miss this timeframe.</p>
          <p>This email contains sensitive information.</p>
          <p>${process.env.CLIENT_URL}</p>
          </body>
          </html>
            `,
        };

        sendMail(mailOptions)
          .then((result) => {
            console.log("Email sent...", result);
            return res.json({
              success: true,
              message: `Email has been sent to ${student_number}@iadt.ie`,
            });
          })
          .catch((error) => {
            console.log(error.message);
            return res
              .status(400)
              .json({ success: false, error: error.message });
          });
      }
    });

    // let transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   auth: {
    //     user: process.env.EMAIL_FROM,
    //     pass: process.env.EMAIL_PW,
    //   },
    //   tls: {
    //     rejectUnauthorized: false,
    //   },
    // });

    // const emailData = {
    //   from: "IADTSU",
    //   to: `${student_number}@iadt.ie`,
    //   subject: "Account Activation Link",
    //   text: `Go to the following link to activate your account: ${process.env.CLIENT_URL}/users/activate/${token}`,
    //   // html: `
    //   // <html>
    //   // <body>
    //   // <h1>Go to the following link to activate your account:</h1>
    //   // <p>${process.env.CLIENT_URL}/users/activate/${token}</p>
    //   // <hr/>
    //   // <p>This email contains sensitive information.</p>
    //   // <p>${process.env.CLIENT_URL}</p>
    //   // </body>
    //   // </html>
    //   // `,
    // };

    // transporter.sendMail(emailData, function (err, data) {
    //   if (err) {
    //     return res.status(400).json({ success: false, error: err });
    //   } else {
    //     return res.json({
    //       success: true,
    //       message: `Email has been sent to ${student_number}@iadt.ie`,
    //     });
    //   }
    // });
  }
};

// Activation and save to database
exports.activationController = (req, res) => {
  const { token } = req.body;

  if (token) {
    // Verify if the token is valid and not expired
    jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          error: "Expired token. Sign up again.",
        });
      } else {
        // if valid save to db
        // Get name, email and password from token
        const {
          first_name,
          last_name,
          student_number,
          pref_first_name,
          password,
        } = jwt.decode(token);

        const user = new User({
          first_name,
          last_name,
          student_number,
          pref_first_name,
          password,
        });

        user.save((err, user) => {
          if (err) {
            return res.status(400).json({
              success: false,
              error: errorHandler(err),
            });
          } else {
            return res.json({
              success: true,
              message: "Signup successful",
            });
          }
        });
      }
    });
  } else {
    return res.json({
      success: false,
      message: "An error occurred. Please try again.",
    });
  }
};

// Login Controller
exports.loginController = (req, res) => {
  const { student_number, password } = req.body;
  const errors = validationResult(req);

  // Validation for req.body
  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      success: false,
      error: firstError,
    });
  } else {
    // Check if user exists
    User.findOne({
      student_number,
    }).exec((err, user) => {
      if (err || !user) {
        return res.status(400).json({
          success: false,
          error: "User with that student number doesn't exist. Please sign up.",
        });
      }

      // Authenticate
      if (!user.authenticate(password)) {
        return res.status(400).json({
          success: false,
          error: "Student number and password do not match.",
        });
      }

      // Generate Token
      const token = jwt.sign(
        {
          _id: user._id,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d", // token valid for 7 days, set remember me in front and set it for 30d
        }
      );

      const {
        _id,
        first_name,
        last_name,
        student_number,
        pref_first_name,
        role,
      } = user;
      return res.json({
        token,
        user: {
          _id,
          first_name,
          last_name,
          student_number,
          pref_first_name,
          role,
        },
      });
    });
  }
};

// exports.deleteController = (req, res) => {
//   User.findOneAndDelete({ _id: req.params.id });
// };

exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET, // req.user._id
  algorithms: ["HS256"],
});

exports.adminMiddleware = (req, res, next) => {
  User.findById({
    _id: req.user._id,
  }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(400).json({
        error: "Admin resource. Access denied.",
      });
    }

    req.profile = user;
    next();
  });
};

// Forgot Password Controller
exports.forgotController = (req, res) => {
  const { student_number, first_name } = req.body;
  const errors = validationResult(req);

  // Validation for req.body
  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      success: false,
      error: firstError,
    });
  } else {
    // Find if user exists
    User.findOne({ student_number }, (err, user) => {
      if (err || !user) {
        return res.status(400).json({
          success: false,
          error: "User with that student number does not exist.",
        });
      }

      // If exists
      // Generate token for user, valid for only 10min
      const token = jwt.sign(
        {
          _id: user._id,
        },
        process.env.JWT_RESET_PASSWORD,
        { expiresIn: "1440m" }
      );

      // Send email with token
      // const emailData = {
      //   from: process.env.EMAIL_FROM,
      //   to: `${student_number}@iadt.ie`,
      //   subject: "Account Password Reset Link",
      //   text: `Go to the following link to reset the password for your account: ${process.env.CLIENT_URL}/users/password/reset/${token}`,
      //   html: `
      //   <h1>Go to the following link to reset the password for your account:</h1>
      //   <p>${process.env.CLIENT_URL}/users/password/reset/${token}</p>
      //   <hr/>
      //   <p>This email contains sensitive information.</p>
      //   <p>${process.env.CLIENT_URL}</p>
      //   `,
      // };

      const mailOptions = {
        from: `IADT SU <${process.env.EMAIL_FROM}`,
        to: `${student_number}@iadt.ie`,
        subject: `IADTSU Elections Account Password Reset`,
        text: `Hello, You have requested a password reset for IADTSU Elections. Go to the following link to complete your request: ${process.env.CLIENT_URL}/users/password/reset/${token}. This link will expire in 10 minutes. Please fill out the forgot password form again if you miss this timeframe.`,
        html: `
        <html>
        <body>
        <p>Hello ${first_name},</p>
        <p>You have requested a password reset for IADTSU Elections. Go to the following link to complete your request:</p>
        <hr/>
        <p><a href="${process.env.CLIENT_URL}/password/reset/${token}">Reset your password</a></p>
        <hr/>
        <p>This link will expire in 24h. Please fill out the forgot password form again if you miss this timeframe.</p>
        <p>This email contains sensitive information.</p>
        <p><a href="${process.env.CLIENT_URL}">IADTSU Elections</a></p>
        </body>
        </html>
          `,
      };

      user.updateOne(
        {
          resetPasswordLink: token,
        },
        (err, success) => {
          if (err) {
            return res.status(400).json({
              success: false,
              error: errorHandler(err),
            });
          } else {
            // Send email
            sendMail(mailOptions)
              .then((result) => {
                console.log("Email sent...", result);
                return res.json({
                  success: true,
                  message: `Email has been sent to ${student_number}@iadt.ie`,
                });
              })
              .catch((error) => {
                console.log(error.message);
                return res
                  .status(400)
                  .json({ success: false, error: error.message });
              });
            // transporter.sendMail(emailData, function (err, data) {
            //   if (err) {
            //     return res
            //       .status(400)
            //       .json({ success: false, error: errorHandler(err) });
            //   } else {
            //     return res.json({
            //       success: true,
            //       message: `Email has been sent to ${student_number}@iadt.ie`,
            //     });
            //   }
            // });
          }
        }
      );
    });
  }
};

// Reset Password Controller
exports.resetController = (req, res) => {
  const { newPassword, resetPasswordLink } = req.body;
  const errors = validationResult(req);

  // Validation for req.body
  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      success: false,
      error: firstError,
    });
  } else {
    if (resetPasswordLink) {
      jwt.verify(
        resetPasswordLink,
        process.env.JWT_RESET_PASSWORD,
        function (err, decoded) {
          if (err) {
            return res.status(400).json({
              success: false,
              error: "Expired link, try again.",
            });
          }

          User.findOne({ resetPasswordLink }, (err, user) => {
            if (err || !user) {
              return res.status(400).json({
                success: false,
                error: "Something went wrong, try again.",
              });
            }

            const updatedFields = {
              password: newPassword,
              resetPasswordLink: "",
            };

            user = _.extend(user, updatedFields);
            user.save((err, result) => {
              if (err) {
                return res.status(400).json({
                  success: false,
                  error: "Error resetting user password.",
                });
              }

              res.json({
                success: true,
                message: `Success! Now you can login with your new password.`,
              });
            });
          });
        }
      );
    }
  }
};
