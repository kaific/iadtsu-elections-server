// Validation Helpers

const { check } = require("express-validator");
const { electionRoles, activeTypes } = require("./constants");

// ======================
// AUTH
// ======================

// Validate Register
exports.validRegister = [
  check("first_name", "First name is required.")
    .notEmpty()
    .isLength({ min: 2, max: 32 })
    .withMessage("Name must be between 2 and 32 characters."),
  check("last_name", "Last name is required.")
    .notEmpty()
    .isLength({ min: 2, max: 32 })
    .withMessage("Name must be between 2 and 32 characters."),
  check("student_number", "Student number is required.")
    .notEmpty()
    .withMessage("Must be a valid email address."),
  check("password", "Password is required.")
    .notEmpty()
    .isLength({
      min: 6,
    })
    .withMessage("Password must contain at least 6 characters.")
    .matches(/\d/)
    .withMessage("Password must contain a number."),
];

// Validate Login
exports.validLogin = [
  check("student_number")
    .notEmpty()
    .withMessage("Must be a valid student number."),
  check("password", "Password is required.").notEmpty(),
];

// Forgot Password
exports.forgotPasswordValidator = [
  check("student_number")
    .not()
    .isEmpty()
    .withMessage("Must be a valid student number."),
];

// Reset Password
exports.resetPasswordValidator = [
  check("newPassword")
    .not()
    .isEmpty()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),
];

// ======================
// ELECTION
// ======================

// Validate Nomination Period
exports.validNominationPeriod = [
  check(
    "startDate",
    "A nomination period must have a valid start date."
  ).isDate(),
  check("endDate", "A nomination period must have a valid end date.").isDate(),
  check("byElection", "By-Election boolean required.").isBoolean(),
];

// Validate Nominee
exports.validNominee = [
  check("token", "Nominee must be a valid user.").notEmpty(),
  check("role", "Role is required.").notEmpty(),
];

// Validate Nomination (Signature)
exports.validNomination = [
  check("token", "Signee must be a valid user.").notEmpty(),
  check("nominee", "Nominee must be a valid user.").notEmpty(),
];

// Validate Candidate
exports.validCandidate = [
  check("user", "A candidate must be a valid user.").notEmpty(),
  check("role", "A candidate must run for a valid role.")
    .notEmpty()
    .isIn(electionRoles),
  check("election", "A candidate must belong to an election.").notEmpty(),
];

// Validate Multiple Candidates
exports.validCandidates = [
  check("candidates", "A candidates array is required.").isArray().notEmpty(),
  check("election", "Candidates must belong to an election.").notEmpty(),
];

//Validate Referendum
exports.validReferendum = [
  check("title", "A referendum must have a title.").notEmpty(),
  check("description", "A referendum must have a description.").notEmpty(),
];

//Validate Election
exports.validElection = [
  check("startDate", "An election must have a valid start date.").notEmpty(),
  check("endDate", "An election must have a valid end date.").notEmpty(),
  check("byElection", "By-Election boolean required.").isBoolean(),
];

//Validate Ballot
exports.validBallot = [
  check("election", "Each ballot must belong to an election.").notEmpty(),
  check("candidateVotes", "A candidateVotes array is required.").isArray(),
  check(
    "reopenNominations",
    "A reopenNominations array is required."
  ).isArray(),
  check("referenda", "A referenda array is required.").isArray(),
];

//Validate Vote
exports.validVote = [
  check("user", "A vote record must belong to a user.").notEmpty(),
  check("election", "A vote record must belong to an election").notEmpty(),
];

//Valid Active
exports.validActive = [
  check("refId", "A nomination or election ID is required.").notEmpty(),
  check("type", 'A type of "election" or "nomination" must be specified')
    .notEmpty()
    .isIn(activeTypes),
];
