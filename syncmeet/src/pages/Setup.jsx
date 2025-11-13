import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Slider } from "@/components/ui/slider";
import { createRoom } from "@/utils/roomHelpers";

export default function Setup() {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState("");
  const [timeRange, setTimeRange] = useState([12, 17]); // [startHour, endHour]
  const [selectedDays, setSelectedDays] = useState([
    "Su",
    "Mo",
    "Tu",
    "We",
    "Th",
    "Fr",
    "Sa",
  ]);
  const [timeSlotDuration, setTimeSlotDuration] = useState(30);

  const allDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const formatTime = (hour) => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const handleCreateRoom = async () => {
    try {
      const userName = localStorage.getItem("userName") || "Anonymous";

      const roomCode = await createRoom(
        {
          name: roomName,
          timeRange,
          selectedDays,
          timeSlotDuration,
        },
        userName
      );

      // Store the room code and navigate
      navigate(`/room/${roomCode}`);
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Failed to create room. Please try again.");
    }
  };

  return (
    <div className="app-container min-h-screen py-8">
      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
      >
        <span>←</span>
        <span>Back</span>
      </button>
      <h1 className="text-3xl font-bold mb-2">Configure room details</h1>

      {/* Room Name */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Give your room a name
        </label>
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Isoc Meetup"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-blue"
        />
      </div>

      {/* Time Range */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Timing</label>
        <div className="mb-2">
          <Slider
            value={timeRange}
            onValueChange={setTimeRange}
            min={0}
            max={24}
            step={1}
            className="mb-4"
          />
          <div className="text-center text-sm text-gray-600">
            {formatTime(timeRange[0])} - {formatTime(timeRange[1])}
          </div>
        </div>
      </div>

      {/* Day Selector and Time Slot Duration */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium">
            Pick the day range
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Time slot</span>
            <select
              value={timeSlotDuration}
              onChange={(e) => setTimeSlotDuration(Number(e.target.value))}
              className="px-3 py-1 rounded border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
            >
              <option value={15}>15 mins</option>
              <option value={30}>30 mins</option>
              <option value={60}>60 mins</option>
            </select>
          </div>
        </div>

        {/* Day chips */}
        <div className="flex gap-2 mb-4">
          {allDays.map((day) => (
            <button
              key={day}
              onClick={() => toggleDay(day)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${
                  selectedDays.includes(day)
                    ? "bg-primary-blue text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }
              `}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Create Room Button */}
      <button
        onClick={handleCreateRoom}
        disabled={!roomName.trim() || selectedDays.length === 0}
        className="w-full bg-primary-blue text-white py-3 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Create room
      </button>
    </div>
  );
}
