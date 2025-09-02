"use strict";
/*
 Sources
 https://institutpf.org/assets/Documents/Normes-projection/InstitutPF-NHP-2024.pdf
 Revised
 2023-04-25
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPF = void 0;
exports.IPF = {
    INFLATION: 0.021,
    PERFORMANCE_RATE: 0.01,
    RETURN_RATES: {
        SHORT_TERM: 0.024,
        FIXED_INCOME: 0.034,
        CANADIAN_EQUITIES: 0.066,
        US_EQUITIES: 0.066,
        INTL_DEVELOPED_MARKET_EQUITIES: 0.069,
        EMERGING_MARKET_EQUITIES: 0.08,
        CONSERVATIVE_PORTFOLIO: 0.028,
        BALANCED_PORTFOLIO: 0.035,
        DYNAMIC_PORTFOLIO: 0.045,
    },
    BORROWING_RATE: 0.044,
};
