import { useState } from "react";
import { useRouter } from "next/router";
import { useCart } from "../context/CartContext";
import toast from 'react-hot-toast';

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();
    const { loadCart } = useCart();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch("http://localhost:5001/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                await loadCart();
                toast.success('Connexion réussie !');
                router.push("/products");
            } else {
                setError(data.message || "Erreur lors de la connexion");
                toast.error(data.message || "Erreur lors de la connexion");
            }
        } catch (error) {
            setError("Erreur lors de la connexion");
            toast.error("Erreur lors de la connexion");
        }
    };

    return (
        <div>
            <h1>Connexion</h1>
            <form onSubmit={handleSubmit}>
                <input 
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Mot de passe" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                />
                <button type="submit">Se connecter</button>
            </form>
        </div>
    );
}