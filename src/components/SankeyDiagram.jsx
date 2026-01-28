import React from 'react';

export const SankeyDiagram = ({
    totalGrossIncome,
    finalDeduction,
    taxableRegularIncome,
    taxableCapGains,
    regularTax,
    capGainTax,
    netIncome
}) => {
    const totalIncome = totalGrossIncome; // Use totalGrossIncome as the base for scaling

    if (totalIncome <= 0) return null;

    // Dimensions
    const width = 800;
    const height = 300;
    const padding = 20;
    const nodeWidth = 20;
    const chartHeight = height - (padding * 2);

    // Scale
    const scale = chartHeight / totalIncome;

    // Coordinates
    const xLeft = padding;
    const xMid = width / 2 - nodeWidth / 2;
    const xRight = width - padding - nodeWidth - 100; // Leave room for labels

    // Heights for each block
    const hTotalGross = totalIncome * scale;

    const hTaxableReg = taxableRegularIncome * scale;
    const hTaxableCap = taxableCapGains * scale;
    const hDeduction = finalDeduction * scale;

    const hRegTax = regularTax * scale;
    const hCapTax = capGainTax * scale;
    const hNet = netIncome * scale;

    // Y Positions for each column
    // Left Column (Total Income)
    const yTotalGross = padding;

    // Middle Column (Breakdown) - Taxable Regular, then Cap Gains, then Deduction at the bottom
    const yTaxableReg = padding;
    const yTaxableCap = yTaxableReg + hTaxableReg;
    const yDeduction = yTaxableCap + hTaxableCap;

    // Right Column (Taxes and Net)
    const yRegTax = padding;
    const yCapTax = yRegTax + hRegTax;
    const yNet = yCapTax + hCapTax;

    // Colors
    const colors = {
        total: "#818cf8", // indigo-400
        taxableReg: "#4ade80", // green-400
        taxableCap: "#22d3ee", // cyan-400
        deduction: "#a78bfa", // violet-400
        regTax: "#f87171", // red-400
        capTax: "#fb923c", // orange-400
        net: "#34d399", // emerald-400
    };

    // Path Generator
    const makePath = (x1, y1, h1, x2, y2, h2, color) => {
        if (h1 <= 0.1 || h2 <= 0.1) return null; // Use a small threshold to avoid rendering tiny paths
        const c1x = x1 + (x2 - x1) / 2;
        const c2x = x2 - (x2 - x1) / 2;
        const d = `M ${x1} ${y1} 
                   C ${c1x} ${y1}, ${c2x} ${y2}, ${x2} ${y2}
                   L ${x2} ${y2 + h2}
                   C ${c2x} ${y2 + h2}, ${c1x} ${y1 + h1}, ${x1} ${y1 + h1}
                   Z`;
        return <path d={d} fill={color} opacity="0.4" />;
    };

    // Calculate net portions from taxable incomes
    const netFromRegular = taxableRegularIncome - regularTax;
    const netFromCapGains = taxableCapGains - capGainTax;
    const hNetFromRegular = netFromRegular * scale;
    const hNetFromCapGains = netFromCapGains * scale;

    return (
        <div className="w-full bg-gray-800 rounded-lg p-6 shadow-lg mt-8 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 text-center">Income & Tax Flow</h3>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto font-sans text-xs">
                {/* --- Flows: Left (Total) -> Mid (Breakdown) --- */}
                {makePath(xLeft + nodeWidth, yTotalGross, hTaxableReg, xMid, yTaxableReg, hTaxableReg, colors.taxableReg)}
                {makePath(xLeft + nodeWidth, yTotalGross + hTaxableReg, hTaxableCap, xMid, yTaxableCap, hTaxableCap, colors.taxableCap)}
                {makePath(xLeft + nodeWidth, yTotalGross + hTaxableReg + hTaxableCap, hDeduction, xMid, yDeduction, hDeduction, colors.deduction)}

                {/* --- Flows: Mid (Breakdown) -> Right (Final) --- */}
                {/* Taxable Regular Income splits into Regular Tax and Net Income */}
                {makePath(xMid + nodeWidth, yTaxableReg, hRegTax, xRight, yRegTax, hRegTax, colors.regTax)}
                {makePath(xMid + nodeWidth, yTaxableReg + hRegTax, hNetFromRegular, xRight, yNet + hDeduction, hNetFromRegular, colors.net)}

                {/* Taxable Capital Gains splits into Capital Gains Tax and Net Income */}
                {makePath(xMid + nodeWidth, yTaxableCap, hCapTax, xRight, yCapTax, hCapTax, colors.capTax)}
                {makePath(xMid + nodeWidth, yTaxableCap + hCapTax, hNetFromCapGains, xRight, yNet + hDeduction + hNetFromRegular, hNetFromCapGains, colors.net)}

                {/* Deduction flows entirely to Net Income */}
                {makePath(xMid + nodeWidth, yDeduction, hDeduction, xRight, yNet, hDeduction, colors.net)}

                {/* --- Nodes & Labels --- */}
                {/* Left Column */}
                <rect x={xLeft} y={yTotalGross} width={nodeWidth} height={hTotalGross} fill={colors.total} rx="2" />
                <text x={xLeft - 5} y={yTotalGross + hTotalGross / 2} fill={colors.total} fontWeight="bold" textAnchor="end" dy="4">Total Income</text>

                {/* Middle Column */}
                {hTaxableReg > 0 && <rect x={xMid} y={yTaxableReg} width={nodeWidth} height={hTaxableReg} fill={colors.taxableReg} rx="2" />}
                {hTaxableCap > 0 && <rect x={xMid} y={yTaxableCap} width={nodeWidth} height={hTaxableCap} fill={colors.taxableCap} rx="2" />}
                {hDeduction > 0 && <rect x={xMid} y={yDeduction} width={nodeWidth} height={hDeduction} fill={colors.deduction} rx="2" />}

                {hTaxableReg > 0 && <text x={xMid + nodeWidth / 2} y={yTaxableReg - 5} fill={colors.taxableReg} textAnchor="middle">Taxable Regular</text>}
                {hTaxableCap > 0 && <text x={xMid + nodeWidth / 2} y={yTaxableCap - 5} fill={colors.taxableCap} textAnchor="middle">Taxable Cap Gains</text>}
                {hDeduction > 0 && <text x={xMid + nodeWidth / 2} y={yDeduction - 5} fill={colors.deduction} textAnchor="middle">Deduction</text>}

                {/* Right Column */}
                {hRegTax > 0 && <rect x={xRight} y={yRegTax} width={nodeWidth} height={hRegTax} fill={colors.regTax} rx="2" />}
                {hCapTax > 0 && <rect x={xRight} y={yCapTax} width={nodeWidth} height={hCapTax} fill={colors.capTax} rx="2" />}
                <rect x={xRight} y={yNet} width={nodeWidth} height={hNet} fill={colors.net} rx="2" />

                {/* Labels Right */}
                {hRegTax > 0 && <text x={xRight + nodeWidth + 10} y={yRegTax + hRegTax / 2} fill={colors.regTax} dy="4">Regular Tax</text>}
                {hCapTax > 0 && <text x={xRight + nodeWidth + 10} y={yCapTax + hCapTax / 2} fill={colors.capTax} dy="4">Capital Gains Tax</text>}
                {hNet > 0 && <text x={xRight + nodeWidth + 10} y={yNet + hNet / 2} fill={colors.net} dy="4" fontWeight="bold">Net Income</text>}
            </svg>
        </div>
    );
};