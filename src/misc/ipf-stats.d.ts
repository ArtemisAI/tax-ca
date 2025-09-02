export interface ReturnRates {
    SHORT_TERM: number;
    FIXED_INCOME: number;
    CANADIAN_EQUITIES: number;
    US_EQUITIES: number;
    INTL_DEVELOPED_MARKET_EQUITIES: number;
    EMERGING_MARKET_EQUITIES: number;
    CONSERVATIVE_PORTFOLIO: number;
    BALANCED_PORTFOLIO: number;
    DYNAMIC_PORTFOLIO: number;
}
export interface IPFStatistics {
    INFLATION: number;
    PERFORMANCE_RATE: number;
    RETURN_RATES: ReturnRates;
    BORROWING_RATE: number;
}
export declare const IPF: IPFStatistics;
