import { User } from "../models/user.models.js";
import { Apiresponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-errors.js";
import { asyncHandler } from "../utils/aysnc-handler.js";
import { emailVerificationMailgenContent, forgotPasswordMailgenContent, sendMail } from "../utils/mail.js";
import jwt from "jsonwebtoken"

const generateAccessTokenandRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessTOken()
        const refreshToken = user.generateRefreshToken()

        User.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})
        return {accessToken , refreshToken}
    } catch (error) {
        throw new ApiError(500 , "Something went wrong while generating access token")
    }
}

const registerUser = asyncHandler(async (req,res) => {
    const { email, username, password, role, fullName } = req.body;
    
    const existedUser = await User.findOne({
        $or: [{email},{username}]
    })

    if(existedUser){
        throw new ApiError(409,"User with email or username Already Exists")
    }

    

const user = await User.create({
    fullName,
    email,
    username,
    password,
    role,
    isEmailVerified: false
});


    const {unhashedToken , hashedToken , tokenExpiry } = user.generateTemporaryToken()
    user.emailVerificationToken = hashedToken
    user.emailVerificationExpiry = tokenExpiry
    await user.save({validateBeforeSave : false})

    await sendMail({
        email : user?.email,
        subject : "Please verify your email",
        mailgenContent : emailVerificationMailgenContent(user.username ,
            `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unhashedToken}`
        )
    })

    const craeatedUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry -resetPasswordToken -resetPasswordExpiry"
    )

    if(!craeatedUser){
        throw new ApiError(500,"Something went wrong while creating user")

    }

    return res.status(201).json(new Apiresponse(200,
        {user : craeatedUser},
        "User registered successfully. Please verify your email"
    ))
})

const login = asyncHandler(async (req,res) => {
    const {email,password,username} = req.body
    if(!email || !username){
        throw new ApiError(400,"Username or email is required")
    }

    const user = await User.findOne({email})
    if(!user){
        throw new ApiError(400, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(400,"Invalid credentials")
    }

   const {accessToken , refreshToken} =  await generateAccessTokenandRefreshToken(user._id)
   const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry -resetPasswordToken -resetPasswordExpiry"
    )

   const options = {
    httpOnly : true,
    secure : true
   }

   return res
            .status(200)
            .cookie("accessToken" , accessToken , options)
            .cookie("refreshToken" , refreshToken , options)
            .json(
                new Apiresponse(200,
                    {
                        user : loggedInUser,
                        accessToken,
                        refreshToken
                    },
                    "User logged in successfully"
                )
            )

})

const logoutUser = asyncHandler( async (req,res) => {
        await User.findByIdAndUpdate(req.user._id,
            {
                refreshToken : null
            },
            {
                new : true
            }
        )

        const options = {
            httpOnly : true,
            secure : true
        }

        return res
            .status(200)
            .clearCookie("accessToken",options)
            .clearCookie("refreshToken",options)
            .json(
                new Apiresponse(200,{},"user logged out successfully")
            )
})

const getCurrentUser = asyncHandler( async (req, res) => {
    return res
       .status(200)
       .json(
        new Apiresponse(
            200,
            req.user,
            "Current user fetched successfully"
        )
       )
})

const verifyEmail = asyncHandler( async (req,res) => {
        const {verificationToken} = req.params
        if(!verificationToken){
            throw new ApiError(400,"Email verification token is not missing")
        }

        let hashedToken = crypto
            .createHash("sha256")
            .update(verificationToken)
            .digest("hex")

        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpiry: {$gt:Date.now()}
        })

        if(!user){
            throw new ApiError(400,"Token is inavalid or expired")
        }

        user.emailVerificationToken = undefined
        user.emailVerificationExpiry = undefined
        user.isEmailVerified = true
        await user.save({validateBeforeSave:false})

        return res
                .status(200)
                .json(
                    new Apiresponse(
                        200,
                        {isEmailVerified : true}
                    ),
                "Email is verified"
                )
})

const resendEmailVerification = asyncHandler ( async (req,res) => {
    const user = await User.findById(req.user._id)
    if(!user){
        throw new ApiError(404,"User not found")
    }
    if(user.isEmailVerified){
        throw new ApiError(409,"Email is already verified")
    }

    const {unhashedToken , hashedToken , tokenExpiry } = user.generateTemporaryToken()
    user.emailVerificationToken = hashedToken
    user.emailVerificationExpiry = tokenExpiry
    await user.save({validateBeforeSave : false})

    await sendMail({
        email : user?.email,
        subject : "Please verify your email",
        mailgenContent : emailVerificationMailgenContent(user.username ,
            `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unhashedToken}`
        )
    })

    return res
        .status(200)
        .json(
            new Apiresponse(
                200,
                {},
                'Mail has been sent to your Email id'
            )
        )
})

const refreshAccessToken = asyncHandler( async (req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized Error")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)

        const user = await  user.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401,"Invalid refresh Token")
        }

        if(incomingRefreshToken!==user.refreshToken){
            throw new ApiError(401,"Refresh Token is Expired")
        }

        const options = {
            httpOnly : true,
            secure : true
        }

        const {accessToken,refreshToken : newRefreshToken} = await generateAccessTokenandRefreshToken(user._id)
        user.refreshToken = newRefreshToken
        await user.save()

        return res
            .status(200)
            .cookie("accessToken",accessToken)
            .cookie("refreshToken",newRefreshToken)
            .json(
                new Apiresponse(
                    200,
                    {accessToken,refreshToken:newRefreshToken},
                    "Access Token refreshed"
                )
            )

    } catch (error) {
        throw new ApiError(401,"Invalid refresh Token")
    }
})

const forgotPasswordRequest = asyncHandler( async (req,res) => {
    const {email} = req.body
    const user = await User.findOne({email})

    if(!user){
        throw new ApiError(404,"User not found")
    }

    const {unhashedToken,hashedToken,tokenExpiry} = user.generateTemporaryToken()
    user.forgortPasswordToken = hashedToken
    user.forgortPasswordExpiry = tokenExpiry

    await user.save({validateBeforeSave: false})

    await sendMail({
        email : user?.email,
        subject : "Password reset mail",
        mailgenContent : forgotPasswordMailgenContent(user.username ,
            `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unhashedToken}`
        )
    })

    return res
        .status(200)
        .json(
            new Apiresponse(
                200,
                {},
                "Password reset mail has been sent to your email id"
            )
        )
})

const resetForgotPassword = asyncHandler ( async (req,res) => {
    const {resetToken} = req.params
    const {newPassword} = req.body

    let hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex")

    const user = await User.findOne({
        forgortPasswordToken : hashedToken,
        forgortPasswordExpiry : {$gt : Date.now()}
    })

    if(!user){
        throw new ApiError(489,"Token is invalid or expired")
    }

    user.forgortPasswordExpiry = undefined
    user.forgortPasswordToken = undefined
    user.password = newPassword
    await user.save({validateBeforeSave : false})

    return res
        .status(200)
        .json(
            new Apiresponse(
                200,
                {},
                "Password has been reset successfully"
            )
        )
})

const changePassword = asyncHandler(async (req,res) => {
    const {oldPassword,newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordValid = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordValid){
        throw new ApiError(400,"Old Password is incorrect")
    }

    user.password = newPassword
    await user.save({validateBeforeSave : false})

    return res
        .status(200)
        .json(
            new Apiresponse(
                200,
                {},
                "Password has been changed successfully"
            )
        )
})


export {registerUser,login,logoutUser,getCurrentUser,verifyEmail,refreshAccessToken,forgotPasswordRequest,resetForgotPassword,changePassword,resendEmailVerification}