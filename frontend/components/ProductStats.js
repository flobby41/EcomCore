export default function ProductStats({ stats }) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-gray-50 p-4 rounded">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">{stat.label}</span>
            <span className="text-sm font-medium">{stat.value}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${stat.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
} 