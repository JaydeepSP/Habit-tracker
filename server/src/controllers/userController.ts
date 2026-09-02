import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  const { name, email, avatar, timezone } = req.body;

  if (name) user.name = name;
  if (avatar !== undefined) user.avatar = avatar;
  if (timezone) user.timezone = timezone;

  if (email && email.toLowerCase() !== user.email) {
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(409).json({
        success: false,
        message: 'This email is already in use by another account',
      });
    }
    user.email = email.toLowerCase();
  }

  await user.save();

  const userObj = user.toObject();
  delete userObj.password;

  res.status(200).json({
    success: true,
    data: {
      user: userObj,
    },
  });
});

// @desc    Change password
// @route   PUT /api/users/password
// @access  Private
export const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both current and new password',
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters long',
    });
  }

  const user = await User.findById(req.user.id).select('+password');

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Incorrect current password',
    });
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
  });
});
