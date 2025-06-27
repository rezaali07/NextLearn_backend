const User = require("../models/UserModel");
const ErrorHandler = require("../utils/ErrorHandler.js");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendMail");
const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;

// Register user
exports.createUser = catchAsyncErrors(async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        let avatar = {
            public_id: "samples/man-portrait",
            url: "https://res.cloudinary.com/dig1ixe4q/image/upload/v1732525014/samples/man-portrait.jpg",
        };

        // Handle avatar via file upload
        if (req.files && req.files.avatar) {
            const result = await cloudinary.uploader.upload(req.files.avatar.tempFilePath, {
                folder: "avatars",
                width: 150,
                crop: "scale",
            });

            avatar = {
                public_id: result.public_id,
                url: result.secure_url,
            };
        }
        // Handle avatar via base64
        else if (req.body.avatar) {
            const result = await cloudinary.uploader.upload(req.body.avatar, {
                folder: "avatars",
                width: 150,
                crop: "scale",
            });

            avatar = {
                public_id: result.public_id,
                url: result.secure_url,
            };
        }

        const user = await User.create({ name, email, password, avatar });

        sendToken(user, 201, res);
    } catch (error) {
        console.error(error);
        return next(new ErrorHandler(error.message, 500));
    }
});

// Login user
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler("Please enter email & password", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorHandler("User not found with this email", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid password", 401));
    }

    sendToken(user, 200, res);
});

// Logout user
exports.logoutUser = catchAsyncErrors(async (req, res, next) => {
    res.clearCookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
});

// Forget password
exports.forgetPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler("No user found with this email", 404));
    }

    const resetToken = user.getResetToken();
    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `http://localhost:3000/password/reset/${resetToken}`;
    const message = `Forgot your password? Click the link below:\n\n${resetPasswordUrl}`;

    try {
        await sendEmail({
            email: user.email,
            subject: "Your password reset token (valid for 10 minutes)",
            message,
        });

        res.status(200).json({
            status: "success",
            message: `Token email sent to ${user.email} successfully`,
        });
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordTime = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(err.message, 500));
    }
});

// Reset password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordTime: { $gt: Date.now() },
    });

    if (!user) {
        return next(new ErrorHandler("Invalid or expired token", 400));
    }

    if (req.body.password !== req.body.passwordConfirm) {
        return next(new ErrorHandler("Passwords do not match", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordTime = undefined;

    await user.save();

    sendToken(user, 200, res);
});

// Get user details
exports.userDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user,
    });
});

// Update user password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Old password is incorrect", 400));
    }

    if (req.body.newPassword !== req.body.passwordConfirm) {
        return next(new ErrorHandler("Passwords do not match", 400));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendToken(user, 200, res);
});

// Update user profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    const { name, email, avatar } = req.body;

    const newUserData = {
        name,
        email,
    };

    if (avatar || (req.files && req.files.avatar)) {
        const user = await User.findById(req.user.id);

        if (user.avatar.public_id) {
            await cloudinary.uploader.destroy(user.avatar.public_id);
        }

        let result;

        if (req.files && req.files.avatar) {
            result = await cloudinary.uploader.upload(req.files.avatar.tempFilePath, {
                folder: "avatars",
                width: 150,
                crop: "scale",
            });
        } else if (avatar) {
            result = await cloudinary.uploader.upload(avatar, {
                folder: "avatars",
                width: 150,
                crop: "scale",
            });
        }

        newUserData.avatar = {
            public_id: result.public_id,
            url: result.secure_url,
        };
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        user: updatedUser,
    });
});

// Get all users (admin)
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        users,
    });
});

// Get single user (admin)
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler("User not found with this ID", 400));
    }

    res.status(200).json({
        success: true,
        user,
    });
});

// Update user role (admin)
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
    const { name, email, role } = req.body;

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { name, email, role },
        { new: true, runValidators: true, useFindAndModify: false }
    );

    res.status(200).json({
        success: true,
        user,
    });
});

// Delete user
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler("User not found with this ID", 400));
    }

    if (user.avatar.public_id) {
        await cloudinary.uploader.destroy(user.avatar.public_id);
    }

    await user.remove();

    res.status(200).json({
        success: true,
        message: "User deleted successfully",
    });
});
