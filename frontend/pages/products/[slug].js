import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useCart } from "../../context/CartContext";
import ReviewsList from '../../components/ReviewsList';

export default function ProductDetail() {
    const router = useRouter();
    const { slug } = router.query;
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        if (!slug) return;
        fetch(`http://localhost:5001/api/products/by-slug/${slug}`)
            .then((res) => res.json())
            .then((data) => {
                setProduct(data);
                setLoading(false);
            })
            .catch((error) => console.error("Error loading product:", error));
    }, [slug]);

    if (loading) return <p className="text-center text-gray-500">Loading...</p>;
    if (!product) return <p className="text-center text-red-500">Product not found</p>;

    const handleAddToCart = () => {
        addToCart(product);
        // Button animation (optional)
        const button = document.activeElement;
        button.classList.add('scale-95');
        setTimeout(() => button.classList.remove('scale-95'), 100);
    };

    return (
        <div className="container mx-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <img src={product.image} alt={product.name} className="w-full h-96 object-cover rounded-lg" />
                <div>
                    <h1 className="text-4xl font-bold">{product.name}</h1>
                    <p className="text-gray-600 text-lg mt-4">{product.description}</p>
                    <p className="text-green-500 font-bold text-2xl mt-4">{product.price} €</p>
                    <button 
                        onClick={handleAddToCart}
                        className="mt-6 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition transform active:scale-95"
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
            <ReviewsList productId={product._id} />
        </div>
    );
}