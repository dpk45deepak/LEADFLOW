import mongoose from 'mongoose';

export const LEAD_SOURCES = [
  'Website',
  'LinkedIn',
  'Referral',
  'Advertisement',
  'Cold Calling',
  'Other',
];
export const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Lost'];

const leadSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 100 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    phone: { type: String, required: [true, 'Phone is required'], trim: true, maxlength: 25 },
    company: { type: String, required: [true, 'Company is required'], trim: true, maxlength: 120 },
    source: { type: String, enum: LEAD_SOURCES, default: 'Website' },
    status: { type: String, enum: LEAD_STATUSES, default: 'New' },
  },
  { timestamps: true },
);

// One lead per email per user (prevents duplicate entries).
leadSchema.index({ userId: 1, email: 1 }, { unique: true });
// Supports the list endpoint: filter by user (+ status) and sort by date / name.
leadSchema.index({ userId: 1, status: 1, createdAt: -1 });
leadSchema.index({ userId: 1, createdAt: -1 });
leadSchema.index({ userId: 1, name: 1 });

leadSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('Lead', leadSchema);
