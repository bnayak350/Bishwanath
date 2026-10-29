/**
 * My Daily Khata – Default Categories
 * System-provided categories with permanent UUIDs, English & Odia names, icon keys, and semantic colors.
 */

import { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  // Expense Categories
  {
    id: 'cat-exp-food',
    category_type: 'expense',
    name_en: 'Food and Groceries',
    name_or: 'ଖାଦ୍ୟ ଏବଂ ତେଜରାତି',
    icon_key: 'utensils',
    color: '#F97316', // Orange
    is_system: true,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-exp-rent',
    category_type: 'expense',
    name_en: 'House Rent',
    name_or: 'ଘର ଭଡ଼ା',
    icon_key: 'home',
    color: '#8B5CF6', // Purple
    is_system: true,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-exp-electricity',
    category_type: 'expense',
    name_en: 'Electricity and Water',
    name_or: 'ବିଜୁଳି ଏବଂ ପାଣି',
    icon_key: 'zap',
    color: '#EAB308', // Yellow
    is_system: true,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-exp-mobile',
    category_type: 'expense',
    name_en: 'Mobile and Internet',
    name_or: 'ମୋବାଇଲ୍ ଏବଂ ଇଣ୍ଟରନେଟ୍',
    icon_key: 'smartphone',
    color: '#3B82F6', // Blue
    is_system: true,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-exp-transport',
    category_type: 'expense',
    name_en: 'Transportation and Fuel',
    name_or: 'ଯାତାୟାତ ଏବଂ ଇନ୍ଧନ',
    icon_key: 'car',
    color: '#06B6D4', // Cyan
    is_system: true,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-exp-education',
    category_type: 'expense',
    name_en: 'Education',
    name_or: 'ଶିକ୍ଷା',
    icon_key: 'graduation-cap',
    color: '#10B981', // Emerald
    is_system: true,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-exp-medical',
    category_type: 'expense',
    name_en: 'Medical and Healthcare',
    name_or: 'ଚିକିତ୍ସା ଏବଂ ସ୍ୱାସ୍ଥ୍ୟ',
    icon_key: 'heart-pulse',
    color: '#EF4444', // Red
    is_system: true,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-exp-shopping',
    category_type: 'expense',
    name_en: 'Shopping',
    name_or: 'କିଣାକିଣି',
    icon_key: 'shopping-bag',
    color: '#EC4899', // Pink
    is_system: true,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-exp-entertainment',
    category_type: 'expense',
    name_en: 'Entertainment',
    name_or: 'ମନୋରଞ୍ଜନ',
    icon_key: 'tv',
    color: '#A855F7', // Violet
    is_system: true,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-exp-emi',
    category_type: 'expense',
    name_en: 'EMI and Loan Payments',
    name_or: 'ଇଏମଆଇ ଏବଂ ଋଣ ପରିଶୋଧ',
    icon_key: 'landmark',
    color: '#64748B', // Slate
    is_system: true,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-exp-insurance',
    category_type: 'expense',
    name_en: 'Insurance',
    name_or: 'ବୀମା',
    icon_key: 'shield',
    color: '#0284C7', // Sky
    is_system: true,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-exp-family',
    category_type: 'expense',
    name_en: 'Family and Personal',
    name_or: 'ପାରିବାରିକ ଏବଂ ବ୍ୟକ୍ତିଗତ',
    icon_key: 'users',
    color: '#F43F5E', // Rose
    is_system: true,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-exp-travel',
    category_type: 'expense',
    name_en: 'Travel',
    name_or: 'ଭ୍ରମଣ',
    icon_key: 'plane',
    color: '#14B8A6', // Teal
    is_system: true,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-exp-agriculture',
    category_type: 'expense',
    name_en: 'Agriculture and Business',
    name_or: 'କୃଷି ଏବଂ ବ୍ୟବସାୟ',
    icon_key: 'sprout',
    color: '#84CC16', // Lime
    is_system: true,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-exp-gifts',
    category_type: 'expense',
    name_en: 'Gifts and Donations',
    name_or: 'ଉପହାର ଏବଂ ଦାନ',
    icon_key: 'gift',
    color: '#D946EF', // Fuchsia
    is_system: true,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-exp-maintenance',
    category_type: 'expense',
    name_en: 'Household Maintenance',
    name_or: 'ଘରୋଇ ରକ୍ଷଣାବେକ୍ଷଣ',
    icon_key: 'wrench',
    color: '#78716C', // Stone
    is_system: true,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-exp-other',
    category_type: 'expense',
    name_en: 'Other',
    name_or: 'ଅନ୍ୟାନ୍ୟ',
    icon_key: 'more-horizontal',
    color: '#9CA3AF', // Gray
    is_system: true,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },

  // Income Categories
  {
    id: 'cat-inc-salary',
    category_type: 'income',
    name_en: 'Salary',
    name_or: 'ଦରମା',
    icon_key: 'briefcase',
    color: '#10B981', // Green
    is_system: true,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-inc-business',
    category_type: 'income',
    name_en: 'Business Income',
    name_or: 'ବ୍ୟବସାୟିକ ଆୟ',
    icon_key: 'store',
    color: '#3B82F6', // Blue
    is_system: true,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-inc-freelance',
    category_type: 'income',
    name_en: 'Freelance Income',
    name_or: 'ଫ୍ରିଲାନ୍ସିଂ ଆୟ',
    icon_key: 'laptop',
    color: '#8B5CF6', // Purple
    is_system: true,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-inc-interest',
    category_type: 'income',
    name_en: 'Interest',
    name_or: 'ସୁଧ',
    icon_key: 'trending-up',
    color: '#06B6D4', // Cyan
    is_system: true,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-inc-rent',
    category_type: 'income',
    name_en: 'Rental Income',
    name_or: 'ଭଡ଼ା ଆୟ',
    icon_key: 'building',
    color: '#F59E0B', // Amber
    is_system: true,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-inc-pension',
    category_type: 'income',
    name_en: 'Pension',
    name_or: 'ପେନ୍ସନ୍',
    icon_key: 'award',
    color: '#059669', // Emerald
    is_system: true,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-inc-gift',
    category_type: 'income',
    name_en: 'Gift Received',
    name_or: 'ପ୍ରାପ୍ତ ଉପହାର',
    icon_key: 'gift',
    color: '#EC4899', // Pink
    is_system: true,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-inc-other',
    category_type: 'income',
    name_en: 'Other Income',
    name_or: 'ଅନ୍ୟାନ୍ୟ ଆୟ',
    icon_key: 'plus-circle',
    color: '#64748B', // Slate
    is_system: true,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];
