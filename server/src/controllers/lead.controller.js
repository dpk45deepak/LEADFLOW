import * as leadService from '../services/lead.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// userId always comes from the authenticated user (req.user), never from the request body.

export const create = asyncHandler(async (req, res) => {
  const lead = await leadService.createLead(req.user._id, req.body);
  res.status(201).json({ success: true, message: 'Lead created', data: lead });
});

export const list = asyncHandler(async (req, res) => {
  const { items, pagination } = await leadService.listLeads(req.user._id, req.validatedQuery);
  res.json({ success: true, data: items, pagination });
});

export const getOne = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await leadService.getLead(req.user._id, req.params.id) });
});

export const update = asyncHandler(async (req, res) => {
  const lead = await leadService.updateLead(req.user._id, req.params.id, req.body);
  res.json({ success: true, message: 'Lead updated', data: lead });
});

export const remove = asyncHandler(async (req, res) => {
  await leadService.deleteLead(req.user._id, req.params.id);
  res.json({ success: true, message: 'Lead deleted' });
});

export const stats = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await leadService.getStats(req.user._id) });
});
