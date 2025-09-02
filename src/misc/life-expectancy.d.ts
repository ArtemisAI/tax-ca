export interface IndividualLifeExpectancy {
    0: number;
    5: number;
    10: number;
    15: number;
    20: number;
    25: number;
    30: number;
    35: number;
    40: number;
    45: number;
    50: number;
    55: number;
    60: number;
    65: number;
    70: number;
    75: number;
    80: number;
    85: number;
    90: number;
    95: number;
    100: number;
}
export interface CombinedLifeExpectancy {
    MALE: IndividualLifeExpectancy;
    FEMALE: IndividualLifeExpectancy;
}
export declare const LIFE_EXPECTANCY: CombinedLifeExpectancy;
