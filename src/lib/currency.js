// Currency configuration
// Set VITE_CURRENCY=GBP in your Vercel env vars for the UK dashboard
// Defaults to NGN for Nigeria

const currency = import.meta.env.VITE_CURRENCY || 'NGN'

export const CURRENCY_SYMBOL = currency === 'GBP' ? '£' : '₦'
export const LOCALE = currency === 'GBP' ? 'en-GB' : 'en-NG'
export const IS_GBP = currency === 'GBP'

export function formatAmount(amount) {
  if (IS_GBP) {
    return `£${Number(amount || 0).toFixed(2)}`
  }
  return `₦${Number(amount || 0).toLocaleString('en-NG')}`
}
