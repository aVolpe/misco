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

export function parseMoney(value?: string): number {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return 0;

    return Number(value
        .trim()
        .replace(/\s/g, '')
        .replace(/\./g, '')
        .replace(/,/g, '.')
    )

}
