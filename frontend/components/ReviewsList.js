import { useState, useEffect } from 'react';
import StarRating from './StarRating';
import ProductStats from './ProductStats';

export default function ReviewsList({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('default');
  const [stats, setStats] = useState([
    { label: 'Safety Standards', value: 94 },
    { label: 'Energy Performance', value: 48 },
    { label: 'Durability', value: 65 }
  ]);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      console.log('Fetching reviews for product:', productId);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reviews/product/${productId}`
      );
      const data = await response.json();
      console.log('Received reviews data:', data);
      setReviews(data.reviews);
      setAverageRating(data.averageRating);
      setTotalReviews(data.totalReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header section */}
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-xl font-bold">Reviews</h2>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
          <StarRating rating={averageRating} size="large" />
          <span className="text-gray-500">({totalReviews} reviews)</span>
        </div>
        <div className="ml-auto">
          <span className="text-green-600 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            All from verified purchases
          </span>
        </div>
      </div>

      {/* Product stats */}
      <ProductStats stats={stats} />

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          className="border rounded-md px-3 py-2"
        >
          <option value="default">Sort by default</option>
          <option value="recent">Most recent</option>
          <option value="highest">Highest rated</option>
          <option value="lowest">Lowest rated</option>
        </select>
        
        <button className="flex items-center gap-2 text-blue-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
          </svg>
          View in original language
        </button>
      </div>

      {/* Reviews list */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review._id} className="border-b pb-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                {/* User avatar placeholder */}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <StarRating rating={review.rating} size="small" />
                  <span className="text-gray-500">|</span>
                  <span className="text-gray-600">{review.userId.name}</span>
                </div>
                
                {review.variant && (
                  <div className="text-sm text-gray-500 mb-2">
                    Color: {review.variant}
                  </div>
                )}
                
                <p className="text-gray-800 mb-4">{review.comment}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  
                  <button className="flex items-center gap-1 text-gray-500 hover:text-blue-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    Helpful ({review.helpfulCount || 0})
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 