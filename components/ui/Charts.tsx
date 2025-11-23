import React from 'react';

// --- Donut Chart ---
interface DonutData {
  label: string;
  value: number;
  color: string;
}

export const DonutChart = ({ data }: { data: DonutData[] }) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  let cumulativePercent = 0;

  if (total === 0) return (
    <div className="flex items-center justify-center h-48 bg-slate-50 dark:bg-slate-800 rounded-full w-48 mx-auto border-4 border-slate-100 dark:border-slate-700">
        <span className="text-xs text-slate-400">Pas de données</span>
    </div>
  );

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
        {data.map((slice, i) => {
          const percent = slice.value / total;
          const strokeDasharray = `${percent * 314} 314`; // 2 * PI * R (R=50) ~ 314
          const strokeDashoffset = -cumulativePercent * 314;
          cumulativePercent += percent;

          return (
            <circle
              key={i}
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke={slice.color}
              strokeWidth="20" // Thick donut
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500 ease-out hover:opacity-80"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-bold text-slate-800 dark:text-white">{total.toLocaleString('fr-FR', {style:'currency', currency:'EUR', maximumFractionDigits:0})}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">Total</span>
      </div>
    </div>
  );
};

// --- Simple Bar Chart ---
export const BarChart = ({ data, height = 150 }: { data: { label: string, value: number }[], height?: number }) => {
    const max = Math.max(...data.map(d => d.value));
    
    return (
        <div className="flex items-end justify-between space-x-2 w-full" style={{ height: `${height}px` }}>
            {data.map((d, i) => (
                <div key={i} className="flex flex-col items-center flex-1 group">
                    <div className="relative w-full flex items-end justify-center">
                        {/* Tooltip on hover */}
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-800 dark:bg-slate-700 text-white text-[10px] py-1 px-2 rounded pointer-events-none transition-opacity z-10 whitespace-nowrap">
                            {d.value.toLocaleString()} €
                        </div>
                        <div 
                            className="w-full bg-indigo-500 rounded-t-sm hover:bg-indigo-600 transition-all duration-300"
                            style={{ 
                                height: max > 0 ? `${(d.value / max) * 100}%` : '0%',
                                minHeight: d.value > 0 ? '4px' : '0'
                            }} 
                        />
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 truncate w-full text-center">{d.label}</span>
                </div>
            ))}
        </div>
    );
};