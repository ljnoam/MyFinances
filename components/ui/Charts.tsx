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
    <div className="relative w-52 h-52 mx-auto">
      {/* Outer Glow Layer (Optional decorative ring) */}
      <div className="absolute inset-2 rounded-full border border-slate-100 dark:border-slate-800 opacity-50"></div>
      
      <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full drop-shadow-sm">
        {data.map((slice, i) => {
          const percent = slice.value / total;
          const strokeDasharray = `${percent * 251.2} 251.2`; // 2 * PI * R (R=40) ~ 251.2
          const strokeDashoffset = -cumulativePercent * 251.2;
          cumulativePercent += percent;

          return (
            <circle
              key={i}
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke={slice.color}
              strokeWidth="12"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round" // Rounded ends for smoother look
              className="transition-all duration-700 ease-out hover:stroke-[14] hover:opacity-90 cursor-pointer"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tighter">
            {total.toLocaleString('fr-FR', {style:'currency', currency:'EUR', maximumFractionDigits:0})}
        </span>
        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mt-1">Total</span>
      </div>
    </div>
  );
};

// --- Modern Bar Chart ---
export const BarChart = ({ data, height = 180 }: { data: { label: string, value: number }[], height?: number }) => {
    const max = Math.max(...data.map(d => d.value), 1); // Avoid div by zero
    
    return (
        <div className="relative w-full" style={{ height: `${height}px` }}>
            {/* Background Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                <div className="w-full h-px bg-slate-900 dark:bg-white border-dashed"></div>
                <div className="w-full h-px bg-slate-900 dark:bg-white border-dashed"></div>
                <div className="w-full h-px bg-slate-900 dark:bg-white border-dashed"></div>
                <div className="w-full h-px bg-slate-900 dark:bg-white border-dashed"></div>
            </div>

            <div className="flex items-end justify-between space-x-3 w-full h-full pt-4 pb-6 px-1">
                {data.map((d, i) => {
                    const heightPct = (d.value / max) * 100;
                    return (
                        <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
                            <div className="relative w-full flex items-end justify-center h-full">
                                {/* Tooltip */}
                                <div className="opacity-0 group-hover:opacity-100 absolute -top-10 transition-all duration-200 bg-slate-800 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold py-1 px-2 rounded-lg shadow-lg pointer-events-none whitespace-nowrap z-10 transform translate-y-2 group-hover:translate-y-0">
                                    {d.value.toLocaleString()}€
                                    {/* Triangle arrow */}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800 dark:border-t-white"></div>
                                </div>
                                
                                {/* Bar */}
                                <div 
                                    className="w-full max-w-[20px] rounded-t-lg transition-all duration-500 ease-out bg-gradient-to-t from-indigo-500 to-purple-400 dark:from-indigo-600 dark:to-purple-500 hover:to-purple-300 dark:hover:to-purple-400 shadow-[0_4px_10px_-2px_rgba(99,102,241,0.3)]"
                                    style={{ 
                                        height: `${heightPct}%`,
                                        minHeight: d.value > 0 ? '6px' : '0'
                                    }} 
                                />
                            </div>
                            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-2 truncate w-full text-center group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                                {d.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};