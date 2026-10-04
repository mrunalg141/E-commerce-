const { body, validationResult } = require('express-validator');

const emailField = body('email')
  .isString().withMessage('Email is required.')
  .bail()
  .trim()
  .toLowerCase()
  .isEmail().withMessage('Enter a valid email address.');

const passwordField = body('password')
  .isString().withMessage('Password is required.')
  .bail()
  .isLength({ min: 8, max: 72 }).withMessage('Password must be between 8 and 72 characters.')
  .bail()
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/).withMessage('Password must include an uppercase letter, a lowercase letter, and a number.');

const returnValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  next();
};

const validateRegister = [
  body('name')
    .isString().withMessage('Name is required.')
    .bail()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters.'),
  emailField,
  passwordField,
  returnValidationErrors,
];

const validateLogin = [emailField, passwordField, returnValidationErrors];

module.exports = { validateRegister, validateLogin };