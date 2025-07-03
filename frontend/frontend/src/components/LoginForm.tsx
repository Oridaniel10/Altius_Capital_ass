import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/auth";
import { isValidEmail } from "../utils/validators";

const websites = [
  { label: "FO1 Website", value: "fo1" },
  { label: "FO2 Website", value: "fo2" },
];

export default function LoginForm() {
  const navigate = useNavigate();
  const [selectedSite, setSelectedSite] = useState("fo1");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // check if user is already logged in when component mounts
  useEffect(() => {
    const savedToken = localStorage.getItem("authToken");
    if (savedToken) {
      // if already logged in, redirect to home
      navigate("/home");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (!isValidEmail(username)) {
      setError("Invalid email address.");
      return;
    }

    try {
      const data = await loginUser({
        website: selectedSite,
        username,
        password,
      });

      // save only authentication data - deals will be fetched separately
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("selectedWebsite", selectedSite);

      // navigate to home page after successful login
      navigate("/home");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[color:var(--cream)] px-4">
      <form onSubmit={handleSubmit} className="card">
        {/* logo */}
        <div className="flex justify-center mb-6">
          <img 
            src="/altius_logo.png" 
            alt="Altius Capital Logo" 
            className="h-16 w-auto"
          />
        </div>
        
        <h2 className="text-2xl font-bold text-center text-[color:var(--blue-dark)] mb-4">
          Altius Capital Login
        </h2>

        <select
          value={selectedSite}
          onChange={(e) => setSelectedSite(e.target.value)}
          className="input-field"
        >
          {websites.map((site) => (
            <option key={site.value} value={site.value}>
              {site.label}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Email"
          className="input-field"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" className="btn-primary w-full">
          Login
        </button>

        {/* error message - always reserve space to prevent form jumping and show it only if there is an error */}
        <div className="min-h-[2rem] mt-3 flex items-center justify-center">
          {error && (
            <p className="text-red-500 font-semibold text-sm text-center">
              {error}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
