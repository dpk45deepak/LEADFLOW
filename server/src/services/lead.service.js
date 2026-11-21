import mongoose from 'mongoose';
import Lead, { LEAD_STATUSES } from '../models/Lead.js';
import { ApiError } from '../utils/ApiError.js';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const notFound = () => ApiError.notFound('Lead not found');

// Every query is scoped by userId: a user can never read or change another user's lead.
// Another user's lead returns 404 (not 403) so its existence is not revealed.

export const createLead = (userId, data) => Lead.create({ ...data, userId });

export async function listLeads(userId, { search, status, page, limit, sortBy, order }) {
  const filter = { userId };
  if (status) filter.status = status;
  if (search) filter.name = { $regex: escapeRegex(search), $options: 'i' };

  const direction = order === 'asc' ? 1 : -1;
  const sort = { [sortBy]: direction, _id: direction };

  const [items, total] = await Promise.all([
    Lead.find(filter)
      .sort(sort)
      .collation({ locale: 'en' })
      .skip((page - 1) * limit)
      .limit(limit),
    Lead.countDocuments(filter),
  ]);

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

export async function getLead(userId, id) {
  const lead = await Lead.findOne({ _id: id, userId });
  if (!lead) throw notFound();
  return lead;
}

export async function updateLead(userId, id, data) {
  const lead = await Lead.findOneAndUpdate({ _id: id, userId }, { $set: data }, { new: true, runValidators: true });
  if (!lead) throw notFound();
  return lead;
}

export async function deleteLead(userId, id) {
  const lead = await Lead.findOneAndDelete({ _id: id, userId });
  if (!lead) throw notFound();
  return lead;
}

export async function getStats(userId) {
  const rows = await Lead.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(String(userId)) } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const stats = Object.fromEntries(LEAD_STATUSES.map((s) => [s, 0]));
  for (const r of rows) stats[r._id] = r.count;
  return { total: Object.values(stats).reduce((a, b) => a + b, 0), ...stats };
}
