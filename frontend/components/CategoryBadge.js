const categoryColors = {
  'Electronics': 'bg-blue-100 text-blue-800',
  'Clothing': 'bg-pink-100 text-pink-800',
  'Home & Garden': 'bg-green-100 text-green-800',
  'Sports': 'bg-orange-100 text-orange-800',
  'Books': 'bg-purple-100 text-purple-800',
  'Toys': 'bg-yellow-100 text-yellow-800',
  'Beauty': 'bg-red-100 text-red-800',
  'Jewelry': 'bg-indigo-100 text-indigo-800',
  'Automotive': 'bg-gray-100 text-gray-800',
  'Office': 'bg-teal-100 text-teal-800'
};

export default function CategoryBadge({ category }) {
  const colorClass = categoryColors[category] || 'bg-gray-100 text-gray-800';
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
      {category}
    </span>
  );
} 