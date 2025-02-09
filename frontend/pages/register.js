import { useState } from "react";
import { useRouter } from "next/router";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleRegister = async (e) => {
        e.preventDefault();
        const res = await fetch("http://localhost:5001/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });

        if (res.ok) {
            alert("Inscription réussie !");
            router.push("/login");
        } else {
            alert("Erreur lors de l'inscription.");
        }
    };

    return (
        <div>
            <h1>Inscription</h1>
            <form onSubmit={handleRegister}>
                <input type="text" placeholder="Nom" value={name} onChange={(e) => setName(e.target.value)} required />
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit">S'inscrire</button>
            </form>
        </div>
    );
}