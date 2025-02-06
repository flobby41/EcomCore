import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between">
                <Link href="/" className="text-xl font-bold">SkandiWall</Link>
                <div>
                    <Link href="/products" className="mx-4">Produits</Link>
                    <Link href="/cart" className="mx-4">🛒 Panier</Link>
                </div>
            </div>
        </nav>
    );
}