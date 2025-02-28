import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to VogueLine
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Discover our collection of high-quality products
            </p>
            <Link
              href="/products"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <span className="text-4xl mb-4 block">🚚</span>
              <h3 className="text-xl font-semibold mb-4">Fast Shipping</h3>
              <p className="text-gray-600">
                Get your products delivered quickly and securely
              </p>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <span className="text-4xl mb-4 block">⭐</span>
              <h3 className="text-xl font-semibold mb-4">Quality Products</h3>
              <p className="text-gray-600">
                Carefully selected items for your satisfaction
              </p>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <span className="text-4xl mb-4 block">💬</span>
              <h3 className="text-xl font-semibold mb-4">24/7 Support</h3>
              <p className="text-gray-600">
                Our team is here to help you anytime
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-600">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to start shopping?
          </h2>
          <p className="text-white text-lg mb-8">
            Join thousands of satisfied customers today
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-md hover:bg-gray-100 transition"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}