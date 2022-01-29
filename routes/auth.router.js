const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  isLoggedIn,
  isValidLinkReset
} = require("../middleware/validators");

const { 
  validRegistration,
  validEmail,
  validPassUpdate,
  validPassReset
} = require("../middleware/joiSchemas");

const auth = require('../controllers/auth.controller');

// --- Register ---
router.get("/register", auth.registerForm);
router.post("/register", validRegistration, auth.registerUser);


// --- Local Login ---
router.get("/login", auth.loginForm);
router.post("/login",
  passport.authenticate("local", {
		failureFlash: true,
		failureRedirect: "login",
	}),
  auth.loginLocal);


// --- Google Login ---
router.get("/google",
	passport.authenticate("google", {
		scope: ["profile", "email"],
	})
);
router.get("/google/callback",
	passport.authenticate("google", {
		failureFlash: true,
		failureRedirect: "login",
	}),
  auth.loginGoogle
);

// --- Logout ---
router.get("/logout", auth.logout);


// --- Email Verification ---
router.get('/verification/email', isLoggedIn, auth.verifyEmailVerification);
router.post('/verification/email', isLoggedIn, auth.verifyEmailSend);


// ---- UPDATE PASSWORD ----
router.get('/password/update', isLoggedIn, auth.updatePassForm);
router.put('/password/update',
  isLoggedIn, validPassUpdate,
  auth.updatePassResult
);


// ----- RESET PASSWORD ------
router.get('/password/reset/request', auth.resetPassRequestForm);
router.post('/password/reset', validEmail, auth.resetPassRequestResult);
router.get('/password/reset/update', isValidLinkReset, auth.resetPassUpdateForm);
router.put('/password/reset/update',
  isValidLinkReset, validPassReset,
  auth.resetPassUpdateResult
);


module.exports = router;
