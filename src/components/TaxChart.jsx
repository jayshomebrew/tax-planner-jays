import React from 'react';

export const TaxChart = ({ breakdown, totalIncome }) => {
    if (!totalIncome || totalIncome === 0) return null;

    // Max rate for Y-axis scaling (e.g. 0.40 for 40%)
    const MAX_RATE = 0.40;

    return (
        <div className="bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Tax Map (Income vs Rate)</h3>

            <div className="relative h-64 w-full bg-gray-700 border-b border-l border-gray-600 flex items-end ml-4 pr-4">
                {/* Y-Axis Labels */}
                <div className="absolute -left-10 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 py-0">
                    <span>40%</span>
                    <span>20%</span>
                    <span>0%</span>
                </div>

                {breakdown.map((block, idx) => {
                    const widthPercent = (block.income / totalIncome) * 100;
                    const heightPercent = Math.min((block.rate / MAX_RATE) * 100, 100);

                    // Color logic
                    let colorClass = 'bg-gray-600';
                    let barColor = 'bg-gray-500';

                    if (block.type === 'Regular') barColor = 'bg-indigo-500';
                    if (block.type === 'Cap Gains') barColor = 'bg-amber-500';
                    if (block.type === 'Deduction') barColor = 'bg-emerald-400';

                    return (
                        <div
                            key={idx}
                            className="relative group border-r border-white last:border-0 hover:opacity-90 transition-all"
                            style={{ width: `${widthPercent}%`, height: '100%' }}
                        >
                            {/* The Bar representing Rate */}
                            <div
                                className={`absolute bottom-0 w-full ${barColor} flex items-end justify-center overflow-hidden transition-all duration-500`}
                                style={{ height: `${Math.max(heightPercent, 1)}%` }} // Min 1% height to show 0% rate blocks
                            >
                                {widthPercent > 8 && (
                                    <span className="text-white text-xs font-bold mb-2 drop-shadow-md">
                                        {(block.rate * 100).toFixed(0)}%
                                    </span>
                                )}
                            </div>

                            {/* Tooltip */}
                            <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap z-20 pointer-events-none shadow-xl">
                                <div className="font-bold text-sm mb-1">{block.label}</div>
                                <div>Income: {block.income.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</div>
                                <div>Tax Paid: {block.tax.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-6 mt-6 text-sm text-gray-300 justify-center">
                <div className="flex items-center"><span className="w-3 h-3 bg-emerald-400 rounded-full mr-2"></span>Deduction (0%)</div>
                <div className="flex items-center"><span className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>Regular Income</div>
                <div className="flex items-center"><span className="w-3 h-3 bg-amber-500 rounded-full mr-2"></span>Capital Gains</div>
            </div>
        </div>
    );
};