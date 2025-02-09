import { useEffect, useState } from "react";
import Link from "next/link";


export default function Home() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch("http://localhost:5001/api/products/featured");
                if (!response.ok) throw new Error("Erreur lors du chargement des produits");
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Bienvenue sur SkandiWall</h1>
            <p className="mb-8">Découvrez nos produits phares !</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {products.length === 0 ? (
                    <p>Aucun produit disponible.</p>
                ) : (
                    products.map((product) => (
                      <Link key={product._id} href={`/products/${product._id}`} passHref>
                        <div key={product._id} className="border p-4 rounded shadow">
                            <img src={product.image} alt={product.name} className="w-full h-40 object-cover mb-2 rounded" />
                            <h2 className="text-xl font-bold">{product.name}</h2>
                            <p>{product.description}</p>
                            <p className="text-lg font-semibold text-blue-600">{product.price} €</p>
                            <button className="bg-blue-500 text-white px-4 py-2 rounded mt-2 hover:bg-blue-700 transition">
                                Voir plus
                            </button>
                        </div>
                      </Link>

                    ))
                )}
            </div>
        </div>
    );
}