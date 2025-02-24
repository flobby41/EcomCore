import { useState } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie'; // Utilisation de js-cookie pour gérer les cookies


export default function AdminLogin() {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5001/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            if (response.ok) {
                const { token } = await response.json();
                console.log('Token reçu:', token);
                localStorage.setItem('adminToken', token); // Token spécifique admin
                Cookies.set('adminToken', token, { expires: 1 }); // Expires in 1 day

                router.push('/admin');
            }
        } catch (error) {
            console.error('Erreur de connexion:', error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full p-2 mb-4 border rounded"
                        onChange={e => setCredentials({...credentials, email: e.target.value})}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-2 mb-4 border rounded"
                        onChange={e => setCredentials({...credentials, password: e.target.value})}
                    />
                    <button 
                        type="submit"
                        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    >
                        Se connecter
                    </button>
                </form>
            </div>
        </div>
    );
} 