export function formatMoney(value: any, symbol?: string, decimalDigits?: number) {
    if (!value && value !== 0) return '';
    if (typeof value === 'string' && value.startsWith('Gs')) return value;

    const amount = decimalDigits ? value : Math.round(value);
    const formattedAmount = new Intl.NumberFormat('it', {
        minimumFractionDigits: decimalDigits || 0,
        maximumFractionDigits: decimalDigits || 0
    }).format(amount);
    const prefix = symbol !== undefined ? `${symbol} ` : '';
    return `${prefix}${formattedAmount}`;
}
