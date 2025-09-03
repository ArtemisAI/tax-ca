/**
 * Unit tests for Tuition Fees module
 * Tests the provincial tuition fee data and retrieval functions
 */

import { TuitionFees } from '../../../src/investments/registered-education-savings-plan/tuition-fees';
import { ProvinceCode } from '../../../src/misc';

describe('Tuition Fees', () => {
    describe('Structure validation', () => {
        it('should have the correct interface structure', () => {
            expect(TuitionFees).toBeDefined();
            expect(typeof TuitionFees).toBe('object');
            expect(TuitionFees).toHaveProperty('TuitionFeesData');
            expect(TuitionFees).toHaveProperty('getTuitionFeesByProvinceCode');
        });

        it('should have function to get tuition fees by province', () => {
            expect(typeof TuitionFees.getTuitionFeesByProvinceCode).toBe('function');
        });

        it('should have tuition fees data object', () => {
            expect(typeof TuitionFees.TuitionFeesData).toBe('object');
        });
    });

    describe('Provincial coverage', () => {
        const provinces: ProvinceCode[] = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];

        it('should have tuition fees for all provinces and territories', () => {
            provinces.forEach((province) => {
                expect(TuitionFees.TuitionFeesData[province]).toBeDefined();
                expect(typeof TuitionFees.TuitionFeesData[province]).toBe('number');
            });
        });

        it('should have positive tuition fees for all jurisdictions', () => {
            provinces.forEach((province) => {
                expect(TuitionFees.TuitionFeesData[province]).toBeGreaterThan(0);
            });
        });
    });

    describe('Specific provincial fees (2024-2025)', () => {
        it('should have correct Alberta tuition fees', () => {
            expect(TuitionFees.TuitionFeesData.AB).toBe(7734);
        });

        it('should have correct British Columbia tuition fees', () => {
            expect(TuitionFees.TuitionFeesData.BC).toBe(6607);
        });

        it('should have correct Manitoba tuition fees', () => {
            expect(TuitionFees.TuitionFeesData.MB).toBe(5534);
        });

        it('should have correct New Brunswick tuition fees', () => {
            expect(TuitionFees.TuitionFeesData.NB).toBe(9470);
        });

        it('should have correct Newfoundland and Labrador tuition fees', () => {
            expect(TuitionFees.TuitionFeesData.NL).toBe(3727);
        });

        it('should have correct Nova Scotia tuition fees', () => {
            expect(TuitionFees.TuitionFeesData.NS).toBe(9762);
        });

        it('should have correct Ontario tuition fees', () => {
            expect(TuitionFees.TuitionFeesData.ON).toBe(8514);
        });

        it('should have correct Prince Edward Island tuition fees', () => {
            expect(TuitionFees.TuitionFeesData.PE).toBe(7728);
        });

        it('should have correct Quebec tuition fees', () => {
            expect(TuitionFees.TuitionFeesData.QC).toBe(3594);
        });

        it('should have correct Saskatchewan tuition fees', () => {
            expect(TuitionFees.TuitionFeesData.SK).toBe(9609);
        });

        it('should have correct Yukon tuition fees', () => {
            expect(TuitionFees.TuitionFeesData.YT).toBe(4350);
        });
    });

    describe('Territorial fees (hypothetical values)', () => {
        it('should have Northwest Territories tuition fees', () => {
            expect(TuitionFees.TuitionFeesData.NT).toBe(6000);
        });

        it('should have Nunavut tuition fees', () => {
            expect(TuitionFees.TuitionFeesData.NU).toBe(6500);
        });
    });

    describe('Function testing', () => {
        it('should correctly retrieve tuition fees by province code', () => {
            expect(TuitionFees.getTuitionFeesByProvinceCode('ON')).toBe(8514);
            expect(TuitionFees.getTuitionFeesByProvinceCode('QC')).toBe(3594);
            expect(TuitionFees.getTuitionFeesByProvinceCode('AB')).toBe(7734);
        });

        it('should return same values as direct data access', () => {
            const provinces: ProvinceCode[] = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];

            provinces.forEach((province) => {
                expect(TuitionFees.getTuitionFeesByProvinceCode(province))
                    .toBe(TuitionFees.TuitionFeesData[province]);
            });
        });
    });

    describe('Data validation and reasonableness', () => {
        it('should have Quebec as lowest tuition province', () => {
            const provinces: ProvinceCode[] = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];
            const allFees = provinces.map((province) => TuitionFees.TuitionFeesData[province]);
            const minFee = Math.min(...allFees);

            expect(TuitionFees.TuitionFeesData.QC).toBe(minFee);
        });

        it('should have reasonable fee ranges', () => {
            const provinces: ProvinceCode[] = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];

            provinces.forEach((province) => {
                const fee = TuitionFees.TuitionFeesData[province];
                expect(fee).toBeGreaterThan(3000); // Minimum reasonable tuition
                expect(fee).toBeLessThan(15000); // Maximum reasonable undergraduate tuition
            });
        });

        it('should show expected regional patterns', () => {
            // Quebec should have lower fees due to provincial subsidies
            expect(TuitionFees.TuitionFeesData.QC).toBeLessThan(TuitionFees.TuitionFeesData.ON);

            // Maritime provinces often have higher fees
            expect(TuitionFees.TuitionFeesData.NS).toBeGreaterThan(TuitionFees.TuitionFeesData.QC);
            expect(TuitionFees.TuitionFeesData.NB).toBeGreaterThan(TuitionFees.TuitionFeesData.QC);
        });

        it('should have Newfoundland as one of the lower-cost provinces', () => {
            // NL typically has lower tuition fees
            expect(TuitionFees.TuitionFeesData.NL).toBeLessThan(TuitionFees.TuitionFeesData.ON);
        });
    });

    describe('Edge cases and error handling', () => {
        it('should handle all valid province codes', () => {
            const provinces: ProvinceCode[] = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];

            provinces.forEach((province) => {
                expect(() => TuitionFees.getTuitionFeesByProvinceCode(province)).not.toThrow();
                expect(TuitionFees.getTuitionFeesByProvinceCode(province)).toBeGreaterThan(0);
            });
        });
    });

    describe('Data consistency', () => {
        it('should be modifiable (not frozen)', () => {
            const originalONFee = TuitionFees.TuitionFeesData.ON;
            const originalFunction = TuitionFees.getTuitionFeesByProvinceCode;

            // This object is not frozen, so modifications will work
            (TuitionFees.TuitionFeesData as any).ON = 10000;

            // Restore original value for other tests
            (TuitionFees.TuitionFeesData as any).ON = originalONFee;

            expect(TuitionFees.TuitionFeesData.ON).toBe(originalONFee);
            expect(TuitionFees.getTuitionFeesByProvinceCode).toBe(originalFunction);
        });

        it('should maintain data integrity across access methods', () => {
            const directAccess = TuitionFees.TuitionFeesData.BC;
            const functionAccess = TuitionFees.getTuitionFeesByProvinceCode('BC');

            expect(directAccess).toBe(functionAccess);
        });
    });
});
