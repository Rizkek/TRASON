import { DEFAULT_FINANCE_CATEGORIES, ICON_NAME_SUGGESTIONS } from '@/libs/defaultCategories';
import { getLocalISODate } from '@/libs/format';

export interface ParsedTransaction {
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category_name?: string;
  date: string;
  source: 'text';
}

const AMOUNT_PATTERNS = [
  // Patterns like 25k, 25rb, 25ribu
  { regex: /(\d+[\d.,]*)\s*(k|rb|ribu)\b/i, multiplier: 1000 },
  // Patterns like 1jt, 1juta, 1m
  { regex: /(\d+[\d.,]*)\s*(jt|juta|m)\b/i, multiplier: 1000000 },
  // Patterns like Rp 25.000 or $15
  { regex: /(?:rp|idr|\$)\s*\.?\s*(\d+[\d.,]*)/i, multiplier: 1 },
  // Fallback: just a bare number
  { regex: /(\d+[\d.,]+)/, multiplier: 1 },
];

const INCOME_KEYWORDS = ['terima', 'gaji', 'dapat', 'masuk', 'income', 'salary', 'bonus', 'refund'];
const EXPENSE_KEYWORDS = ['beli', 'bayar', 'makan', 'minum', 'jajan', 'belanja', 'spent', 'pay'];

const CATEGORY_HINTS: Record<string, string[]> = {
  'Makanan & Minuman': ['makan', 'lunch', 'dinner', 'breakfast', 'nasi', 'coffee', 'kopi', 'minum', 'jajan', 'cafe', 'resto', 'gojek', 'gofood', 'grabfood'],
  'Transportasi': ['gojek', 'grab', 'bensin', 'parkir', 'toll', 'ojek', 'kereta', 'bus', 'taxi'],
  'Belanja': ['beli', 'shopee', 'tokopedia', 'lazada', 'amazon', 'mall', 'baju', 'sepatu'],
  'Kesehatan': ['obat', 'dokter', 'rs', 'rumah sakit', 'klinik', 'apotek', 'vitamin'],
  'Hiburan': ['nonton', 'bioskop', 'netflix', 'spotify', 'game', 'main', 'tiket'],
  'Rumah & Utilitas': ['listrik', 'air', 'token', 'pulsa', 'kuota', 'internet', 'wifi', 'pdam', 'pln', 'kost', 'sewa'],
  'Gaji': ['gaji', 'salary', 'upah', 'paycheck'],
  'Investasi': ['saham', 'crypto', 'reksa dana', 'bibit', 'ajaib', 'invest'],
};

export function parseTransactionText(input: string): ParsedTransaction | null {
  const text = input.trim().toLowerCase();
  if (!text) return null;

  let amount = 0;
  let rawAmountMatch = '';

  // 1. Extract Amount
  for (const pattern of AMOUNT_PATTERNS) {
    const match = text.match(pattern.regex);
    if (match) {
      rawAmountMatch = match[0];
      const numStr = match[1].replace(/,/g, '');
      const parsedNum = parseFloat(numStr);
      if (!isNaN(parsedNum)) {
        amount = parsedNum * pattern.multiplier;
        break;
      }
    }
  }

  // If no amount found, parsing fails (AI can take over if needed)
  if (amount === 0) return null;

  // 2. Extract Type
  let type: 'income' | 'expense' = 'expense'; // default
  for (const keyword of INCOME_KEYWORDS) {
    if (text.includes(keyword)) {
      type = 'income';
      break;
    }
  }

  // 3. Extract Category
  let categoryName: string | undefined;
  for (const [cat, keywords] of Object.entries(CATEGORY_HINTS)) {
    for (const keyword of keywords) {
      // Use word boundaries for better matching
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(text)) {
        categoryName = cat;
        break; // found keyword
      }
    }
    if (categoryName) break; // found category
  }

  // 4. Extract Title/Merchant (remove the amount string)
  let title = input.replace(new RegExp(rawAmountMatch, 'i'), '').trim();
  
  // Clean up residual keywords if they are standalone
  const commonPrefixes = ['beli', 'bayar', 'spent', 'on', 'for', 'rp', 'idr', 'k', 'rb', 'ribu', 'jt', 'juta'];
  let titleWords = title.split(/\s+/);
  titleWords = titleWords.filter(word => {
    return !commonPrefixes.includes(word.toLowerCase()) || word.length > 5;
  });
  
  title = titleWords.join(' ').trim();
  
  // Title formatting
  if (!title) {
    title = categoryName || 'Transaction';
  } else {
    // Capitalize first letter of each word
    title = title.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  return {
    title,
    amount,
    type,
    category_name: categoryName,
    date: getLocalISODate(),
    source: 'text'
  };
}
