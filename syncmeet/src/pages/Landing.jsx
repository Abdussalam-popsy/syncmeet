import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (name.trim()) {
      // Store name in localStorage for now (will move to Firebase later)
      localStorage.setItem("userName", name);
      navigate("/setup");
    }
  };

  return (
    <div className="app-container min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold mb-4">Syncmeet</h1>
      <p className="text-xl mb-8">Find the time that works for everyone</p>
      <input
        type="text"
        placeholder="What's your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="px-4 py-3 rounded-lg border border-gray-300 mb-4 w-64"
      />
      <button
        onClick={handleGetStarted}
        disabled={!name.trim()}
        className="bg-primary-blue text-white px-8 py-3 rounded-lg w-64 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Get started
      </button>
      <button
        onClick={() => navigate("/join")}
        className="text-primary-blue px-8 py-3 rounded-lg border border-primary-blue w-64 hover:bg-blue-50"
      >
        Join an existing room
      </button>
    </div>
  );
}
