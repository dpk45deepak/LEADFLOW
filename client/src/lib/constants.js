export const LEAD_SOURCES = ['Website', 'LinkedIn', 'Referral', 'Advertisement', 'Cold Calling', 'Other'];
export const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Lost'];

// New: blue, Contacted: orange, Qualified: green, Lost: red
export const STATUS_STYLES = {
  New: { badge: 'bg-blue-50 text-blue-700 ring-blue-600/20', dot: 'bg-blue-500', hex: '#2563eb' },
  Contacted: { badge: 'bg-orange-50 text-orange-700 ring-orange-600/20', dot: 'bg-orange-500', hex: '#f97316' },
  Qualified: { badge: 'bg-green-50 text-green-700 ring-green-600/20', dot: 'bg-green-500', hex: '#16a34a' },
  Lost: { badge: 'bg-red-50 text-red-700 ring-red-600/20', dot: 'bg-red-500', hex: '#dc2626' },
};

export const PAGE_SIZES = [10, 25, 50];
