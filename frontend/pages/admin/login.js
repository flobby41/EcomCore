import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie'; // Utilisation de js-cookie pour gérer les cookies


export default function AdminLogin() {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const router = useRouter();

    // Vérifier si déjà connecté
    useEffect(() => {
        const adminToken = Cookies.get('adminToken');
        if (adminToken && !router.query.logout) {
            router.push('/admin');
        }
    }, [router]);

    // Gérer le logout
    useEffect(() => {
        if (router.query.logout) {
            Cookies.remove('adminToken');
            localStorage.removeItem('adminToken');
            router.replace('/admin/login');
        }
    }, [router.query.logout]);

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
                localStorage.setItem('adminToken', token);
                Cookies.set('adminToken', token, { expires: 1 });
                router.push('/admin');
            } else {
                const error = await response.json();
                alert(error.message || 'Login failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Connection error');
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
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
} 