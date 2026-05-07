export default function MetricCard({ icon, iconBg, value, label, trend, trendType, detail, critical, showProgress, progress }) {
  return (
    <div className={`metric-card relative overflow-hidden group ${critical ? 'border-red-200 ring-4 ring-red-500/5' : ''}`}>
      {critical && (
        <div className="absolute top-0 right-0 p-4">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
        </div>
      )}

      <div className="flex justify-between items-start mb-6">
        <div className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center text-2xl shadow-sm transition-transform group-hover:scale-110 duration-300`}>
          <i className={`fas fa-${icon}`}></i>
        </div>
        {trend && (
          <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 ${
            trendType === 'positive'
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
              : trendType === 'negative'
              ? 'bg-rose-50 text-rose-600 border border-rose-100'
              : 'bg-slate-50 text-slate-500 border border-slate-100'
          }`}>
            <i className={`fas fa-arrow-${trendType === 'positive' ? 'up' : trendType === 'negative' ? 'up' : 'minus'} text-[8px]`}></i>
            {trend}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className={`text-4xl font-black tracking-tight ${critical ? 'text-red-600' : 'text-slate-900'}`}>
          {value}
        </div>
        <div className="text-[11px] text-slate-400 font-black uppercase tracking-[0.15em]">{label}</div>
      </div>

      {detail && (
        <div className="mt-6 pt-6 border-t border-slate-50">
          {showProgress ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{detail}</span>
                <span className="text-[10px] font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden p-0.5 shadow-inner-soft">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${
                    progress > 80 ? 'bg-gradient-to-r from-rose-500 to-red-600 shadow-[0_0_8px_rgba(225,29,72,0.3)]' :
                    progress > 50 ? 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]' :
                    'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                  }`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{detail}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

