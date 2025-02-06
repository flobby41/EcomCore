import { useEffect, useState } from "react";
import Link from "next/link";

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:5001/api/products")
            .then((res) => res.json())
            .then((data) => {
                setProducts(data);
                setLoading(false);
            })
            .catch((error) => console.error("Erreur lors du chargement des produits :", error));
    }, []);

    if (loading) return <p className="text-center text-gray-500">Chargement des produits...</p>;

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold text-center mb-6">Nos Produits</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {products.map((product) => (
                    <Link key={product._id} href={`/products/${product._id}`} passHref>
                        <div className="border p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition">
                            <img src={product.image} alt={product.name} className="w-full h-48 object-cover mb-4" />
                            <h2 className="text-xl font-semibold">{product.name}</h2>
                            <p className="text-gray-600">{product.description}</p>
                            <p className="text-green-500 font-bold text-lg mt-2">{product.price} €</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}