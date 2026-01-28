import { STANDARD_DEDUCTIONS, SENIOR_ADDON, CAP_GAINS_BRACKETS, FALLBACK_BRACKETS } from '../constants';

export const calculateTaxes = ({
    year,
    filingStatus,
    isSenior,
    regularIncome,
    capGainIncome,
    itemizedDeduction,
    useStandard,
    taxData
}) => {
    // 1. Determine Standard Deduction
    let baseStandard = STANDARD_DEDUCTIONS[year]?.[filingStatus] || 12000;
    let seniorAmount = 0;

    if (isSenior) {
        const addonKey = filingStatus.includes('married') ? 'married' : 'single';
        seniorAmount = SENIOR_ADDON[year]?.[addonKey] || 0;
    }

    const totalStandard = baseStandard + seniorAmount;
    const finalDeduction = useStandard ? Math.max(totalStandard, itemizedDeduction) : itemizedDeduction;

    // 2. Taxable Income Split
    const totalGrossIncome = regularIncome + capGainIncome;
    const taxableRegularIncome = Math.max(0, regularIncome - finalDeduction);
    const remainingDeduction = Math.max(0, finalDeduction - regularIncome);
    const taxableCapGains = Math.max(0, capGainIncome - remainingDeduction);

    // 3. Calculate Regular Tax
    let regularTax = 0;
    let brackets = [];
    let taxBreakdown = [];

    if (taxData && taxData[filingStatus]) {
        brackets = taxData[filingStatus].brackets || taxData[filingStatus] || [];
    } else {
        // Fallback logic
        const rawFallback = FALLBACK_BRACKETS[filingStatus] || FALLBACK_BRACKETS.single;
        brackets = rawFallback.map(b => ({ rate: b[0], cap: b[1] }));
    }

    let previousCap = 0;
    for (let bracket of brackets) {
        const rate = bracket.rate || bracket.tax_rate || 0;
        const cap = bracket.cap || bracket.threshold || bracket.max || Infinity;

        const width = cap - previousCap;
        const incomeInBracket = Math.min(Math.max(0, taxableRegularIncome - previousCap), width);

        if (incomeInBracket > 0) {
            const taxAmount = incomeInBracket * rate;
            regularTax += taxAmount;
            taxBreakdown.push({
                type: 'Regular',
                rate: rate,
                income: incomeInBracket,
                tax: taxAmount,
                label: `Regular ${(rate * 100).toFixed(1)}%`
            });
        }
        previousCap = cap;

        if (taxableRegularIncome <= previousCap) break;
    }

    // 4. Calculate Capital Gains Tax
    let capGainTax = 0;
    const cgBrackets = CAP_GAINS_BRACKETS[year]?.[filingStatus] || [40000, 400000];

    // 0% Rate
    const incomeIn0 = Math.max(0, Math.min(taxableRegularIncome + taxableCapGains, cgBrackets[0]) - taxableRegularIncome);
    // 15% Rate
    const incomeIn15 = Math.max(0, Math.min(taxableRegularIncome + taxableCapGains, cgBrackets[1]) - Math.max(taxableRegularIncome, cgBrackets[0]));
    // 20% Rate
    const incomeIn20 = Math.max(0, (taxableRegularIncome + taxableCapGains) - Math.max(taxableRegularIncome, cgBrackets[1]));

    if (incomeIn0 > 0) taxBreakdown.push({ type: 'Cap Gains', rate: 0, income: incomeIn0, tax: 0, label: 'Cap Gains 0%' });
    if (incomeIn15 > 0) taxBreakdown.push({ type: 'Cap Gains', rate: 0.15, income: incomeIn15, tax: incomeIn15 * 0.15, label: 'Cap Gains 15%' });
    if (incomeIn20 > 0) taxBreakdown.push({ type: 'Cap Gains', rate: 0.20, income: incomeIn20, tax: incomeIn20 * 0.20, label: 'Cap Gains 20%' });

    // Add Deduction at the start for the chart
    if (finalDeduction > 0) {
        taxBreakdown.unshift({
            type: 'Deduction',
            rate: 0,
            income: finalDeduction,
            tax: 0,
            label: 'Deduction'
        });
    }

    capGainTax = (incomeIn0 * 0) + (incomeIn15 * 0.15) + (incomeIn20 * 0.20);

    const totalTax = regularTax + capGainTax;
    const effectiveRate = totalGrossIncome > 0 ? (totalTax / totalGrossIncome) * 100 : 0;

    return {
        totalStandard,
        finalDeduction,
        taxableRegularIncome,
        taxableCapGains,
        regularTax,
        capGainTax,
        totalTax,
        effectiveRate,
        totalGrossIncome,
        taxBreakdown
    };
};
