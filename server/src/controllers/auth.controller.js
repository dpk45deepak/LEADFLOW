import * as authService from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const data = await authService.register(req.body);
  res.status(201).json({ success: true, message: 'Account created', data });
});

export const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body);
  res.json({ success: true, message: 'Logged in', data });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});
