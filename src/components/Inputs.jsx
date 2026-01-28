import React from 'react';

export const Card = ({ children, className = "" }) => (
    <div className={`bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
        {children}
    </div>
);

export const SliderInput = ({ label, value, onChange, min, max, step, format = true, markers = [] }) => (
    <div className="mb-6">
        <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-gray-300">{label}</label>
            <span className="text-sm font-bold text-indigo-400">
                {format ? value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) : value}
            </span>
        </div>
        <div className="relative w-full">
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded block"
                style={{ accentColor: '#4F46E5' }}
            />
            {markers.map((m, i) => {
                const percent = ((m - min) / (max - min)) * 100;
                if (percent < 0 || percent > 100) return null;
                return (
                    <div
                        key={i}
                        className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-yellow-400 pointer-events-none opacity-60"
                        style={{ left: `${percent}%` }}
                    />
                );
            })}
        </div>
    </div>
);

export const SelectInput = ({ label, value, onChange, options }) => (
    <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border bg-gray-700 text-white"
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);

export const Checkbox = ({ label, checked, onChange }) => (
    <div className="flex items-center mb-6">
        <input
            id={`checkbox-${label}`}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded bg-gray-700"
        />
        <label htmlFor={`checkbox-${label}`} className="ml-2 block text-sm text-gray-300">
            {label}
        </label>
    </div>
);
