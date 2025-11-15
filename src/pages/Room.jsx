import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TimeGrid from "../components/TimeGrid";
import ResultsGrid from "../components/ResultsGrid";
import { toast } from "react-hot-toast";
import {
  getRoom,
  addParticipant,
  updateParticipantBusySlots,
  subscribeToParticipants,
} from "@/utils/roomHelpers";
import ParticipantModal from "@/components/ParticipantModal";

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [busySlots, setBusySlots] = useState([]);
  const [room, setRoom] = useState(null);
  const [participantId, setParticipantId] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("mark");
  const [filter, setFilter] = useState("everything");
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  // Load room data on mount
  useEffect(() => {
    const loadRoom = async () => {
      try {
        const roomData = await getRoom(roomId);
        if (roomData) {
          setRoom(roomData);

          const userName = localStorage.getItem("userName") || "Anonymous";

          // Check if we already have a participantId for this room
          const storedParticipantId = localStorage.getItem(
            `participant_${roomId}`
          );

          if (storedParticipantId) {
            setParticipantId(storedParticipantId);
          } else {
            const pId = await addParticipant(roomId, {
              name: userName,
              busySlots: [],
            });
            setParticipantId(pId);
            localStorage.setItem(`participant_${roomId}`, pId);
          }
        } else {
          toast.error("Room not found!");
        }
      } catch (error) {
        console.error("Error loading room:", error);
        toast.error("Failed to load room, please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadRoom();
  }, [roomId]);

  // Subscribe to participants in real-time
  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = subscribeToParticipants(roomId, (participantsList) => {
      console.log("Participants from Firebase:", participantsList);
      setParticipants(participantsList);

      const currentParticipant = participantsList.find(
        (p) => p.id === participantId
      );
      if (currentParticipant) {
        setBusySlots(currentParticipant.busySlots || []);
      }
    });

    return () => unsubscribe();
  }, [roomId, participantId]);

  // Update busy slots in Firebase when they change
  const handleSlotToggle = async (slotId) => {
    const newBusySlots = busySlots.includes(slotId)
      ? busySlots.filter((id) => id !== slotId)
      : [...busySlots, slotId];

    setBusySlots(newBusySlots);

    if (participantId) {
      await updateParticipantBusySlots(roomId, participantId, newBusySlots);
    }
  };

  const handleShare = async () => {
    // Dynamic URL that works locally and on any domain
    const url = `${window.location.origin}/join?room=${roomId}`;

    // Check if mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Try native share on mobile only
    if (isMobile && navigator.share) {
      try {
        await navigator.share({
          title: "Join my Syncmeet room",
          text: `Find a time that works for everyone! Room code: ${roomId}`,
          url: url,
        });
        return;
      } catch (err) {
        if (err.name === "AbortError") {
          return;
        }
      }
    }

    // Use clipboard for desktop (or if mobile share failed)
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Room link copied!");
    } catch (err) {
      prompt("Copy this link manually:", url);
    }
  };

  if (loading) {
    return (
      <div className="app-container min-h-screen py-8 flex items-center justify-center">
        <p className="text-gray-600">Loading room...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="app-container min-h-screen py-8">
        <h1 className="text-3xl font-bold mb-4">Room not found</h1>
        <p>The room code may be invalid or the room may have been deleted.</p>
      </div>
    );
  }

  return (
    <div className="app-container h-screen flex flex-col py-4 md:py-8">
      {/* Header */}
      {/* Header */}
      <div className="flex justify-between items-start mb-2 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="text-gray-600 hover:text-gray-900"
            aria-label="Go home"
          >
            ← Home
          </button>
          <h1 className="text-3xl font-bold">
            {view === "mark" ? "When are you busy?" : "Available times"}
          </h1>
        </div>
        <button
          onClick={handleShare}
          className="bg-primary-blue text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600"
        >
          Share
        </button>
      </div>

      <div className="flex items-center gap-4 mb-4 flex-shrink-0">
        {view === "mark" ? (
          <p className="text-gray-600">Select times you are busy</p>
        ) : (
          <p className="text-gray-600">
            Current time:{" "}
            {new Date().toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {view === "results" ? (
            <button
              onClick={() => setShowParticipantModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.99992 6.66665C9.47268 6.66665 10.6666 5.47274 10.6666 3.99998C10.6666 2.52722 9.47268 1.33331 7.99992 1.33331C6.52716 1.33331 5.33325 2.52722 5.33325 3.99998C5.33325 5.47274 6.52716 6.66665 7.99992 6.66665Z"
                  stroke="black"
                />
                <path
                  d="M13.3334 11.6667C13.3334 13.3233 13.3334 14.6667 8.00008 14.6667C2.66675 14.6667 2.66675 13.3233 2.66675 11.6667C2.66675 10.01 5.05475 8.66666 8.00008 8.66666C10.9454 8.66666 13.3334 10.01 13.3334 11.6667Z"
                  stroke="black"
                />
              </svg>
              <span className="font-bold">
                {new Set(participants.map((p) => p.name)).size}
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Room Code:</span>
              <span className="font-mono font-bold text-lg">{roomId}</span>
            </div>
          )}
        </div>
      </div>

      {view === "results" && (
        <div className="mb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1 rounded border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
            >
              <option value="everything">Everything</option>
              <option value="earliest">Earliest available</option>
              <option value="mornings">Mornings</option>
              <option value="afternoons">Afternoons</option>
              <option value="evenings">Evenings</option>
            </select>
          </div>
        </div>
      )}

      {/* Grid - grows to fill remaining space */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {view === "mark" ? (
          <TimeGrid
            startTime={room.startTime}
            endTime={room.endTime}
            days={room.days}
            timeSlotDuration={room.timeSlotDuration}
            busySlots={busySlots}
            onSlotToggle={handleSlotToggle}
          />
        ) : (
          <ResultsGrid
            startTime={room.startTime}
            endTime={room.endTime}
            days={room.days}
            timeSlotDuration={room.timeSlotDuration}
            participants={participants}
            filter={filter}
          />
        )}
      </div>

      {/* Bottom buttons - fixed height */}
      <div className="flex gap-4 mt-4 flex-shrink-0">
        <button
          onClick={() => setView("mark")}
          className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
            view === "mark"
              ? "bg-primary-blue text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Mark busy
        </button>
        <button
          onClick={() => setView("results")}
          className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
            view === "results"
              ? "bg-primary-blue text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          View results
        </button>
      </div>

      {/* Participant Modal */}
      {showParticipantModal && (
        <ParticipantModal
          participants={participants}
          currentParticipantId={participantId}
          onClose={() => setShowParticipantModal(false)}
        />
      )}
    </div>
  );
}
