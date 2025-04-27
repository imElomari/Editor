// src/pages/Home.tsx
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user, signOut } = useAuth();

  return (
    <div className="p-8">
      <h1>Selam {user?.email}</h1>
      <button onClick={signOut} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
        Sign Out
      </button>
    </div>
  );
}