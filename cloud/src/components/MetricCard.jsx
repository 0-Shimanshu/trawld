export default function MetricCard({ icon, iconBg, value, label, trend, trendType, detail, critical, showProgress, progress }) {
  return (
    <div className={`metric-card ${critical ? 'border-red-500/50' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${iconBg} flex items-center justify-center text-white text-xl`}>
          <i className={`fas fa-${icon}`}></i>
        </div>
        <div className={`px-2 py-1 rounded-md text-xs font-semibold ${
          trendType === 'positive' 
            ? 'bg-green-500/20 text-green-400' 
            : trendType === 'negative'
            ? 'bg-red-500/20 text-red-400'
            : 'bg-gray-500/20 text-gray-400'
        }`}>
          <i className={`fas fa-arrow-${trendType === 'positive' ? 'up' : trendType === 'negative' ? 'up' : 'minus'} mr-1`}></i>
          {trend}
        </div>
      </div>
      <div className="mb-4">
        <div className={`text-4xl font-bold mb-2 ${critical ? 'text-red-400' : 'text-white'}`}>
          {value}
        </div>
        <div className="text-sm text-gray-400 font-medium">{label}</div>
      </div>
      <div className="pt-4 border-t border-dark-700">
        {showProgress ? (
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>{detail}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <span className="text-xs text-gray-500">{detail}</span>
        )}
      </div>
    </div>
  )
}

