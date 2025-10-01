import { body } from "express-validator";

const userRegistrationValidator = () => {
   return [ body("email")
       .trim()
       .notEmpty()
       .withMessage("Email is required")
       .isEmail()
       .withMessage("Invalid Email format"),
    body("username")
        .trim()
        .notEmpty()
        .withMessage("Username is reuqired")
        .isLowercase()
        .withMessage("Username must be in lowercase")
        .isLength({min:3})
        .withMessage("Username must be at least 3 characters long"),
    body("password")
        .trim()
        .notEmpty()
        .withMessage("Password is required"),
    body("fullName")
        .optional()
        .trim() 
   ];     

}

const userLoginValidator = () => {
    return [
        body("email")
            .optional()
            .isEmail()
            .withMessage("Email id invalid"),
        body("password")
            .notEmpty()
            .withMessage("Password is required")
    ]
}

const userChangeCurrentPasswordValidator = () => {
    return [
        body("oldPassword")
        .notEmpty()
        .withMessage("Old Password is required"),

        body("newPassword")
        .notEmpty()
        .withMessage("New Password is required")  
    ]
}

const userForgotPasswordValidator = () => {
    return [
        body("email")
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid")
    ]
}

const userResetForgotPasswordValidator = () => {
    return [
        body("newPassword")
            .notEmpty()
            .withMessage("Password is required")
    ]
}

export {userRegistrationValidator, 
    userLoginValidator,
    userChangeCurrentPasswordValidator,
    userForgotPasswordValidator,
    userResetForgotPasswordValidator,
}