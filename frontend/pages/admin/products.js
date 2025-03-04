import { useState, useEffect } from 'react';
import AdminLayout from './layout';
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function ProductsAdmin() {
    const [products, setProducts] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: '',
        image: '',
        category: '',
        stock: ''
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/products');
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const response = await fetch(`http://localhost:5001/api/products/${productId}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    fetchProducts(); // Refresh list
                }
            } catch (error) {
                console.error('Error during deletion:', error);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = selectedProduct 
                ? `http://localhost:5001/api/products/${selectedProduct._id}`
                : 'http://localhost:5001/api/products';
            
            const method = selectedProduct ? 'PUT' : 'POST';
            const productData = selectedProduct ? { ...selectedProduct, ...newProduct } : newProduct;

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
            });

            if (response.ok) {
                setIsEditing(false);
                setSelectedProduct(null);
                setNewProduct({
                    name: '',
                    description: '',
                    price: '',
                    image: '',
                    category: '',
                    stock: ''
                });
                fetchProducts();
            }
        } catch (error) {
            console.error('Error while saving:', error);
        }
    };

    return (
        <AdminLayout>
            <div className="container mx-auto px-6 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold">Product Management</h1>
                    <Button onClick={() => setIsEditing(true)}>
                        Add Product
                    </Button>
                </div>

                <Card className="overflow-x-auto">
                    <table className="w-full whitespace-nowrap">
                        <thead>
                            <tr className="text-left font-bold">
                                <th className="px-6 py-3 border-b">Image</th>
                                <th className="px-6 py-3 border-b">Name</th>
                                <th className="px-6 py-3 border-b">Price</th>
                                <th className="px-6 py-3 border-b">Stock</th>
                                <th className="px-6 py-3 border-b">Category</th>
                                <th className="px-6 py-3 border-b">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <img 
                                            src={product.image} 
                                            alt={product.name}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                    </td>
                                    <td className="px-6 py-4">{product.name}</td>
                                    <td className="px-6 py-4">${product.price}</td>
                                    <td className="px-6 py-4">{product.stock}</td>
                                    <td className="px-6 py-4">{product.category}</td>
                                    <td className="px-6 py-4">
                                        <Button 
                                            onClick={() => {
                                                setSelectedProduct(product);
                                                setNewProduct(product);
                                                setIsEditing(true);
                                            }}
                                            className="mr-2"
                                        >
                                            Edit
                                        </Button>
                                        <Button 
                                            onClick={() => handleDelete(product._id)}
                                            className="bg-red-500 hover:bg-red-600"
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>

                {isEditing && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <Card className="w-full max-w-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">
                                {selectedProduct ? 'Edit Product' : 'Add Product'}
                            </h2>
                            <form onSubmit={handleSubmit}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block mb-1">Name</label>
                                        <input
                                            type="text"
                                            value={newProduct.name}
                                            onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                                            className="w-full p-2 border rounded"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1">Description</label>
                                        <textarea
                                            value={newProduct.description}
                                            onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                                            className="w-full p-2 border rounded"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1">Price</label>
                                        <input
                                            type="number"
                                            value={newProduct.price}
                                            onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                                            className="w-full p-2 border rounded"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1">Image URL</label>
                                        <input
                                            type="url"
                                            value={newProduct.image}
                                            onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                                            className="w-full p-2 border rounded"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1">Category</label>
                                        <input
                                            type="text"
                                            value={newProduct.category}
                                            onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                                            className="w-full p-2 border rounded"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1">Stock</label>
                                        <input
                                            type="number"
                                            value={newProduct.stock}
                                            onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                                            className="w-full p-2 border rounded"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-2 mt-6">
                                    <Button 
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setSelectedProduct(null);
                                        }}
                                        className="bg-gray-500 hover:bg-gray-600"
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        {selectedProduct ? 'Update' : 'Create'}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
