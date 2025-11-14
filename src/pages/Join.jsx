import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRoom } from "@/utils/roomHelpers";

export default function Join() {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const roomCodeFromUrl = searchParams.get("room") || "";

  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState(roomCodeFromUrl);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoinRoom = async () => {
    setError("");

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!roomCode.trim()) {
      setError("Please enter a room code");
      return;
    }

    setLoading(true);

    try {
      // Check if room exists
      const room = await getRoom(roomCode.toUpperCase());

      if (room) {
        // Store name and navigate to room
        localStorage.setItem("userName", name);
        navigate(`/room/${roomCode.toUpperCase()}`);
      } else {
        setError("Room not found. Please check the code and try again.");
      }
    } catch (error) {
      console.error("Error joining room:", error);
      setError("Failed to join room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container min-h-screen flex flex-col items-center justify-center">
      {/* Back button - positioned absolutely in top left */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-8 left-8 flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <span>←</span>
        <span>Back</span>
      </button>
      <h1 className="text-5xl font-bold mb-4">Syncmeet</h1>
      <p className="text-xl mb-8">Find the time that works for everyone</p>

      <div className="w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Join an existing room
        </h2>

        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 mb-4 focus:outline-none focus:ring-2 focus:ring-primary-blue"
        />

        <input
          type="text"
          placeholder="Room code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 mb-4 focus:outline-none focus:ring-2 focus:ring-primary-blue font-mono"
          maxLength={6}
        />

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <button
          onClick={handleJoinRoom}
          disabled={loading}
          className="w-full bg-primary-blue text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Joining..." : "Join room"}
        </button>
      </div>
    </div>
  );
}
