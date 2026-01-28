// 
// 2026 Jan
// 
// prompts by a human, created by AI.
// 

import React, { useState, useMemo } from 'react';
import { useTaxData } from './hooks/useTaxData';
import { calculateTaxes } from './utils/taxCalculations';
import { FALLBACK_BRACKETS } from './constants';
import { Card, SliderInput, SelectInput, Checkbox } from './components/Inputs';
import { TaxChart } from './components/TaxChart';
import { SankeyDiagram } from './components/SankeyDiagram';

const App = () => {
    // --- State Management ---
    // Core tax parameters
    const [year, setYear] = useState(2026);
    const [filingStatus, setFilingStatus] = useState('single');
    const [isSenior, setIsSenior] = useState(false);

    // Income sources
    const [regularIncomes, setRegularIncomes] = useState([60000]);
    const [capGainIncomes, setCapGainIncomes] = useState([0]);

    // Deductions configuration
    const [itemizedDeduction, setItemizedDeduction] = useState(0);
    const [useStandard, setUseStandard] = useState(true);

    // UI state
    const [snapEnabled, setSnapEnabled] = useState(false);

    // --- Data Fetching ---
    // Fetch tax brackets and standard deduction data for the selected year
    const { data: taxData, loading, error } = useTaxData(year);

    // Calculate totals for tax computation
    const totalRegularIncome = useMemo(() => regularIncomes.reduce((acc, val) => acc + val, 0), [regularIncomes]);
    const totalCapGainIncome = useMemo(() => capGainIncomes.reduce((acc, val) => acc + val, 0), [capGainIncomes]);

    // --- Core Calculations ---
    // Memoize tax calculations to prevent re-running on every render unless inputs change
    const results = useMemo(() => {
        return calculateTaxes({
            year,
            filingStatus,
            isSenior,
            regularIncome: totalRegularIncome,
            capGainIncome: totalCapGainIncome,
            itemizedDeduction,
            useStandard,
            taxData
        });
    }, [year, filingStatus, isSenior, totalRegularIncome, totalCapGainIncome, itemizedDeduction, useStandard, taxData]);

    // Calculate Net Income
    const netIncome = results.totalGrossIncome - results.totalTax;

    // --- Helper Logic ---
    // Calculate snap points for the income slider based on tax brackets.
    // This helps users easily select income levels that align with bracket thresholds.
    const snapPoints = useMemo(() => {
        let brackets = [];
        // Try to get brackets from loaded data
        if (taxData && taxData[filingStatus]) {
            brackets = taxData[filingStatus].brackets || taxData[filingStatus] || [];
        }

        // Fallback to constants if data isn't loaded yet
        if (brackets.length === 0) {
            const rawFallback = FALLBACK_BRACKETS[filingStatus] || FALLBACK_BRACKETS.single;
            brackets = rawFallback.map(b => ({ rate: b[0], cap: b[1] }));
        }

        // Adjust bracket thresholds by adding the deduction amount, 
        // effectively showing where taxable income hits the bracket in terms of gross income.
        const deduction = results.finalDeduction;
        return brackets
            .map(b => (b.cap || b.threshold || b.max))
            .filter(cap => cap && cap !== Infinity)
            .map(cap => cap + deduction)
            .sort((a, b) => a - b);
    }, [taxData, filingStatus, results.finalDeduction]);

    // Define the chart section here to make it simple to rearrange in the layout below
    const taxChartSection = (
        <TaxChart breakdown={results.taxBreakdown} totalIncome={results.totalGrossIncome} />
    );

    // --- Event Handlers ---
    // Handles income slider changes with optional "snapping" to bracket thresholds
    const handleRegularIncomeChange = (index, newValue) => {
        let val = newValue;
        if (snapEnabled) {
            const SNAP_RADIUS = 2000; // Range within which snapping occurs
            for (let point of snapPoints) {
                if (Math.abs(newValue - point) < SNAP_RADIUS) {
                    val = point;
                    break;
                }
            }
        }
        const newIncomes = [...regularIncomes];
        newIncomes[index] = val;
        setRegularIncomes(newIncomes);
    };

    const addRegularIncome = () => {
        if (regularIncomes.length < 5) setRegularIncomes([...regularIncomes, 0]);
    };

    const handleCapGainChange = (index, newValue) => {
        const newIncomes = [...capGainIncomes];
        newIncomes[index] = newValue;
        setCapGainIncomes(newIncomes);
    };

    const addCapGainIncome = () => {
        if (capGainIncomes.length < 5) setCapGainIncomes([...capGainIncomes, 0]);
    };

    const removeRegularIncome = (index) => {
        const newIncomes = [...regularIncomes];
        newIncomes.splice(index, 1);
        setRegularIncomes(newIncomes);
    };

    const removeCapGainIncome = (index) => {
        const newIncomes = [...capGainIncomes];
        newIncomes.splice(index, 1);
        setCapGainIncomes(newIncomes);
    };

    return (
        <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 flex justify-center font-sans text-gray-100">
            <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* --- Left Column: Inputs --- */}
                <div className="space-y-6">
                    {/* Header */}
                    <div className="text-center lg:text-left mb-8">
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">Jay's Tax Estimator</h1>
                        <p className="mt-2 text-gray-400">Plan your {year} taxes with precision.</p>
                    </div>

                    {/* Configuration Card: Year, Status, Senior Check */}
                    <Card>
                        <h2 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">Configuration</h2>
                        <SelectInput
                            label="Tax Year"
                            value={year}
                            onChange={(v) => setYear(Number(v))}
                            options={[
                                { value: 2025, label: '2025' },
                                { value: 2026, label: '2026' }
                            ]}
                        />
                        <SelectInput
                            label="Filing Status"
                            value={filingStatus}
                            onChange={setFilingStatus}
                            options={[
                                { value: 'single', label: 'Single' },
                                { value: 'married_jointly', label: 'Married Filing Jointly' },
                                { value: 'married_separately', label: 'Married Filing Separately' },
                                { value: 'head_of_household', label: 'Head of Household' }
                            ]}
                        />
                        <Checkbox
                            label="Senior (65+)"
                            checked={isSenior}
                            onChange={setIsSenior}
                        />
                    </Card>

                    {/* Income Card: Regular & Capital Gains */}
                    <Card>
                        <h2 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">Income</h2>

                        {/* --- Regular Income Sliders --- */}
                        {/* Map through all regular income entries and render a slider for each */}
                        {regularIncomes.map((income, index) => (
                            <SliderInput
                                key={`reg-${index}`}
                                // Label logic: First one is just "Regular Income", others are numbered
                                label={index === 0 ? "Regular Income" : (
                                    <span className="flex items-center">
                                        Regular Income {index + 1}
                                        {/* Remove Button for additional income streams */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeRegularIncome(index); }}
                                            className="ml-2 text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
                                            title="Remove"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </span>
                                )}
                                value={income}
                                onChange={(val) => handleRegularIncomeChange(index, val)}
                                min={index === 0 ? 10000 : 0} // Ensure primary income has a base minimum
                                max={500000}
                                step={100}
                                markers={snapEnabled ? snapPoints : []} // Pass snap points if enabled
                            />
                        ))}

                        {/* Controls: Add Button & Snap Toggle */}
                        <div className="-mt-4 mb-6 flex justify-between items-center">
                            <div>
                                {/* Add Button: Only show if fewer than 5 sliders */}
                                {regularIncomes.length < 5 && (
                                    <button
                                        onClick={addRegularIncome}
                                        className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center transition-colors mt-2"
                                    >
                                        <span className="text-lg mr-1">+</span> Add Regular Income
                                    </button>
                                )}
                            </div>

                            {/* Snap Toggle Control: Enables snapping sliders to tax brackets */}
                            <div className="flex items-center relative group mt-2">
                                <label htmlFor="snap-toggle" className="text-sm font-medium text-gray-300 mr-3">
                                    Snap to Brackets
                                </label>
                                <button
                                    id="snap-toggle"
                                    onClick={() => setSnapEnabled(!snapEnabled)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${snapEnabled ? 'bg-indigo-600' : 'bg-gray-600'}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${snapEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                                    />
                                </button>
                                {/* Tooltip for Snap Points: Shows exact bracket values on hover */}
                                <div className="absolute bottom-full right-0 mb-2 w-56 p-3 bg-gray-800 text-xs text-gray-200 rounded shadow-xl border border-gray-700 hidden group-hover:block z-10">
                                    <div className="font-semibold mb-2 text-white border-b border-gray-600 pb-1">Snap Points (Income)</div>
                                    <ul className="space-y-1">
                                        {snapPoints.map((val, i) => (
                                            <li key={i} className="flex justify-between">
                                                <span>Bracket {i + 1}:</span>
                                                <span className="font-mono text-indigo-300">
                                                    {val.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* --- Capital Gains Sliders --- */}
                        {/* Map through all capital gains entries */}
                        {capGainIncomes.map((income, index) => (
                            <SliderInput
                                key={`cap-${index}`}
                                // Label logic with Remove button for additional entries
                                label={index === 0 ? "Capital Gains" : (
                                    <span className="flex items-center">
                                        Capital Gains {index + 1}
                                        {/* Remove Button for additional capital gains streams */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeCapGainIncome(index); }}
                                            className="ml-2 text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
                                            title="Remove"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </span>
                                )}
                                value={income}
                                onChange={(val) => handleCapGainChange(index, val)}
                                min={0}
                                max={500000}
                                step={500}
                            />
                        ))}

                        {/* Add Button for Capital Gains */}
                        {capGainIncomes.length < 5 && (
                            <button
                                onClick={addCapGainIncome}
                                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center transition-colors -mt-4 mb-2"
                            >
                                <span className="text-lg mr-1">+</span> Add Capital Gains
                            </button>
                        )}
                    </Card>

                    {/* Deductions Card: Standard vs Itemized */}
                    <Card>
                        <h2 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">Deductions</h2>
                        {/* Standard Deduction Toggle Switch */}
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-sm font-medium text-gray-300">Standard Deduction</label>
                            <div className="flex items-center">
                                <span className="mr-2 text-sm text-gray-500">
                                    {useStandard ? 'Active' : 'Inactive'}
                                </span>
                                <button
                                    onClick={() => setUseStandard(!useStandard)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${useStandard ? 'bg-indigo-600' : 'bg-gray-600'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useStandard ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>

                        {/* Itemized Deduction Input Field (Disabled if Standard is active) */}
                        <div className={`transition-opacity duration-200 ${useStandard ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Itemized Deduction Amount</label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-gray-400 sm:text-sm">$</span>
                                </div>
                                <input
                                    type="number"
                                    value={itemizedDeduction}
                                    onChange={(e) => setItemizedDeduction(Number(e.target.value))}
                                    className="block w-full rounded-md border-gray-600 bg-gray-700 text-white pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 border"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        {useStandard && (
                            <div className="mt-2 text-sm text-indigo-400 font-medium">
                                Using Standard: {results.totalStandard.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                            </div>
                        )}
                    </Card>
                </div>

                {/* --- Right Column: Results --- */}
                <div className="space-y-6">
                    {/* Tax Map / Chart Section */}
                    {taxChartSection}

                    {/* Summary Card */}
                    <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex flex-col justify-center">
                        <div className="text-center">
                            <h2 className="text-indigo-100 text-sm font-semibold uppercase tracking-wider">Estimated Total Tax</h2>
                            <div className="text-5xl font-extrabold mt-2">
                                {results.totalTax.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                            </div>
                            <div className="mt-4 inline-block bg-white/20 rounded-full px-4 py-1 text-sm font-medium backdrop-blur-sm">
                                Effective Rate: {results.effectiveRate.toFixed(2)}%
                            </div>
                        </div>

                        <div className="mt-12 space-y-4 border-t border-white/20 pt-8">
                            <div className="flex justify-between items-center">
                                <span className="text-indigo-100">Total Income</span>
                                <span className="font-bold">{results.totalGrossIncome.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                            </div>
                            <div className="relative group flex justify-between items-center">
                                <span className="text-indigo-100 cursor-help">Net Income</span>
                                <span className="font-bold text-emerald-300">{netIncome.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                                <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-gray-900 text-xs text-gray-200 rounded shadow-xl border border-gray-700 hidden group-hover:block z-10 pointer-events-none">
                                    <div className="font-semibold mb-2 text-white border-b border-gray-600 pb-1">Net Income Calculation</div>
                                    <div className="flex justify-between"><span>Total Income:</span> <span className="font-mono">{results.totalGrossIncome.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
                                    <div className="flex justify-between"><span>- Total Tax:</span> <span className="font-mono text-red-300">{results.totalTax.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
                                    <div className="flex justify-between border-t border-gray-600 mt-1 pt-1 font-bold"><span>= Net Income:</span> <span className="font-mono text-emerald-300">{netIncome.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-indigo-100">Deduction Applied</span>
                                <span className="font-bold text-red-200">-{results.finalDeduction.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                            </div>
                            <div className="relative group flex justify-between items-center border-t border-white/10 pt-2">
                                <span className="text-indigo-100 cursor-help">Regular Tax</span>
                                <span className="font-bold">{results.regularTax.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                                <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-gray-900 text-xs text-gray-200 rounded shadow-xl border border-gray-700 hidden group-hover:block z-10 pointer-events-none">
                                    <div className="font-semibold mb-2 text-white border-b border-gray-600 pb-1">Regular Tax Breakdown</div>
                                    <ul className="space-y-1">
                                        {results.taxBreakdown
                                            .filter(b => b.type === 'Regular' && b.tax > 0)
                                            .map((b, i) => (
                                                <li key={i} className="flex justify-between items-center">
                                                    <span className="text-gray-300">{b.income.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })} @ {(b.rate * 100).toFixed(1)}%</span>
                                                    <span className="font-mono text-indigo-300">= {b.tax.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</span>
                                                </li>
                                            ))
                                        }
                                        {results.regularTax === 0 && <li>No regular tax incurred.</li>}
                                    </ul>
                                    <div className="flex justify-between border-t border-gray-600 mt-2 pt-2 font-bold">
                                        <span>Total:</span>
                                        <span className="font-mono">{results.regularTax.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="relative group flex justify-between items-center">
                                <span className="text-indigo-100 cursor-help">Capital Gains Tax</span>
                                <span className="font-bold">{results.capGainTax.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                                <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-gray-900 text-xs text-gray-200 rounded shadow-xl border border-gray-700 hidden group-hover:block z-10 pointer-events-none">
                                    <div className="font-semibold mb-2 text-white border-b border-gray-600 pb-1">Capital Gains Tax Breakdown</div>
                                    <ul className="space-y-1">
                                        {results.taxBreakdown
                                            .filter(b => b.type === 'Cap Gains' && b.tax > 0)
                                            .map((b, i) => (
                                                <li key={i} className="flex justify-between items-center">
                                                    <span className="text-gray-300">{b.income.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })} @ {(b.rate * 100).toFixed(1)}%</span>
                                                    <span className="font-mono text-amber-300">= {b.tax.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</span>
                                                </li>
                                            ))
                                        }
                                        {results.capGainTax === 0 && <li>No capital gains tax incurred.</li>}
                                    </ul>
                                    <div className="flex justify-between border-t border-gray-600 mt-2 pt-2 font-bold">
                                        <span>Total:</span>
                                        <span className="font-mono">{results.capGainTax.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Debug / Info Panel */}
                    <div className="bg-yellow-900/30 border-l-4 border-yellow-600 p-4 rounded shadow-sm">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-200">
                                    <strong>Data Source:</strong> {loading ? "Fetching..." : (error ? "Fallback Data (Fetch Failed)" : "Live JSON Loaded")}
                                </p>
                                <p className="text-xs text-yellow-300 mt-1">
                                    Capital Gains brackets are estimated based on 2025/2026 projections.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sankey Diagram Section */}
            {/*             <div className="max-w-4xl w-full mt-8">
                <SankeyDiagram
                    totalGrossIncome={results.totalGrossIncome}
                    finalDeduction={results.finalDeduction}
                    taxableRegularIncome={results.taxableRegularIncome}
                    taxableCapGains={results.taxableCapGains}
                    regularTax={results.regularTax}
                    capGainTax={results.capGainTax}
                    netIncome={netIncome}
                />
            </div> */}
        </div>
    );
};

export default App;
