import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5001/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            console.log("📦 Réponse login:", data);

            if (data.token) {
                // Stockage du token avec le préfixe "Bearer"
                localStorage.setItem("token", `Bearer ${data.token}`);
                // ou sans le préfixe si vous préférez l'ajouter dans les requêtes
                // localStorage.setItem("token", data.token);
                router.push("/");
            }
        } catch (error) {
            console.error("❌ Erreur login:", error);
        }
    };

    return (
        <div>
            <h1>Connexion</h1>
            <form onSubmit={handleLogin}>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit">Se connecter</button>
            </form>
        </div>
    );
}