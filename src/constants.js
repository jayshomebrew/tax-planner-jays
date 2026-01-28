export const TAX_DATA_URLS = {
    2025: 'https://raw.githubusercontent.com/multifol-io/financial-variables/refs/heads/main/data/usa/irs/irs.tax-rates.2025.json',
    2026: 'https://raw.githubusercontent.com/multifol-io/financial-variables/refs/heads/main/data/usa/irs/irs.tax-rates.2026.json'
};

export const STANDARD_DEDUCTIONS = {
    2025: { single: 15750, married_jointly: 31500, married_separately: 15750, head_of_household: 23625 },
    2026: { single: 16100, married_jointly: 32200, married_separately: 16100, head_of_household: 24150 }
};

export const SENIOR_ADDON = {
    2025: { single: 2000, married: 1600 },
    2026: { single: 2050, married: 1650 }
};

export const CAP_GAINS_BRACKETS = {
    2025: {
        single: [48350, 533400],
        married_jointly: [96700, 600050],
        married_separately: [48350, 300000],
        head_of_household: [64750, 566700]
    },
    2026: {
        single: [49450, 545500],
        married_jointly: [98900, 613700],
        married_separately: [49450, 306850],
        head_of_household: [66200, 579600]
    }
};

// Fallback brackets in case API fails
export const FALLBACK_BRACKETS = {
    single: [[0.10, 11925], [0.12, 48475], [0.22, 103350], [0.24, 197300], [0.32, 250525], [0.35, 626350], [0.37, Infinity]],
    married_jointly: [[0.10, 23850], [0.12, 96950], [0.22, 206700], [0.24, 394600], [0.32, 501050], [0.35, 751600], [0.37, Infinity]]
};
