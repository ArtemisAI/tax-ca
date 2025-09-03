export function getMonthsDiff(firstDate: Date, secondDate: Date): number {
    const monthsDiff = secondDate.getUTCMonth() - firstDate.getUTCMonth();
    const yearsDiff = secondDate.getUTCFullYear() - firstDate.getUTCFullYear();

    return monthsDiff + (12 * yearsDiff) - (secondDate.getUTCDate() < firstDate.getUTCDate() ? 1 : 0);
}

export function addYearsToDate(date: Date, years: number): Date {
    const newDate = new Date(date.valueOf());
    newDate.setUTCFullYear(date.getUTCFullYear() + years);
    return newDate;
}

export function now(): Date {
    // Use globalThis instead of process for better compatibility
    const env = (globalThis as any)?.process?.env?.NODE_ENV;
    return env === 'test' ? new Date('2020-01-01T12:00:00Z') : new Date();
}
