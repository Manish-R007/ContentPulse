import { Router } from "express";
import {login , registerUser , logoutUser, verifyEmail, refreshAccessToken ,forgotPasswordRequest,resetForgotPassword, getCurrentUser, changePassword, resendEmailVerification} from "../controllers/auth.controllers.js";
import { userChangeCurrentPasswordValidator, userForgotPasswordValidator, userLoginValidator, userRegistrationValidator, userResetForgotPasswordValidator } from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";
import { verifyJWT } from "../controllers/auth.middleware.js";

const router =  Router()

//unsecured route
router.route("/register").post(userRegistrationValidator(), validate , registerUser)
router.route("/login").post(userLoginValidator(),validate,login)
router.route("/verify-email/:verificationToken").get(verifyEmail)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/forgot-password").post(userForgotPasswordValidator(),validate,forgotPasswordRequest)
router.route("/reset-password/:resetForgotPassword").post(userResetForgotPasswordValidator(),validate,resetForgotPassword )

//secure routes
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/current-user").post(verifyJWT,getCurrentUser)
router.route("/change-password").post(userChangeCurrentPasswordValidator(),validate,changePassword)
router.route('/resend-email-verification').post(verifyJWT,resendEmailVerification)

export default router