import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

const signToken = (user) =>
  jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' });

export async function register({ name, email, password }) {
  if (await User.exists({ email })) {
    throw ApiError.conflict('An account with this email already exists', [
      { field: 'email', message: 'An account with this email already exists' },
    ]);
  }
  const user = await User.create({ name, email, password });
  return { user, token: signToken(user) };
}

export async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+password');
  // Same message for unknown email and wrong password: don't reveal which accounts exist.
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  return { user, token: signToken(user) };
}
