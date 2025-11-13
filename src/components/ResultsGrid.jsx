import { useMemo } from "react";

const ResultsGrid = ({
  startTime,
  endTime,
  days,
  timeSlotDuration,
  participants,
  filter = "everything",
}) => {
  // Helper function - define FIRST before using it in useMemo
  const getSlotId = (day, time) => `${day}-${time}`;

  // Generate time slots
  const timeSlots = useMemo(() => {
    const slots = [];
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    let currentHour = startHour;
    let currentMin = startMin;
    const endTotalMinutes = endHour * 60 + endMin;

    while (true) {
      const currentTotalMinutes = currentHour * 60 + currentMin;
      if (currentTotalMinutes >= endTotalMinutes) break;

      const timeString = `${String(currentHour).padStart(2, "0")}:${String(
        currentMin
      ).padStart(2, "0")}`;
      slots.push(timeString);

      currentMin += timeSlotDuration;
      if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60);
        currentMin = currentMin % 60;
      }
    }

    return slots;
  }, [startTime, endTime, timeSlotDuration]);

  // Find the earliest available slot (where busyCount === 0)
  const earliestAvailableTime = useMemo(() => {
    for (const time of timeSlots) {
      for (const day of days) {
        const busyCount = participants.filter((p) =>
          p.busySlots.includes(getSlotId(day, time))
        ).length;

        if (busyCount === 0) {
          return time;
        }
      }
    }
    return null;
  }, [timeSlots, days, participants, getSlotId]);

  // Filter time slots based on filter
  const filteredTimeSlots = useMemo(() => {
    if (filter === "everything") return timeSlots;

    if (filter === "earliest") {
      return earliestAvailableTime ? [earliestAvailableTime] : [];
    }

    return timeSlots.filter((time) => {
      const [hour] = time.split(":").map(Number);

      if (filter === "mornings") {
        return hour >= 6 && hour < 12;
      } else if (filter === "afternoons") {
        return hour >= 12 && hour < 17;
      } else if (filter === "evenings") {
        return hour >= 17 && hour < 24;
      }

      return true;
    });
  }, [timeSlots, filter, earliestAvailableTime]);

  // Count how many participants are busy at this slot
  const getBusyCount = (day, time) => {
    const slotId = getSlotId(day, time);
    return participants.filter((p) => p.busySlots.includes(slotId)).length;
  };

  // Get participants who are busy at this slot
  const getBusyParticipants = (day, time) => {
    const slotId = getSlotId(day, time);
    return participants
      .filter((p) => p.busySlots.includes(slotId))
      .map((p) => p.name);
  };

  // Determine slot color based on busy count
  const getSlotColor = (busyCount, totalParticipants) => {
    if (busyCount === 0) {
      return "bg-available";
    } else if (busyCount === totalParticipants) {
      return "bg-busy";
    } else {
      return "bg-red-200";
    }
  };

  const totalParticipants = participants.length;

  // Handle empty state - ADD THIS BEFORE THE MAIN RETURN
  if (filteredTimeSlots.length === 0) {
    return (
      <div className="overflow-x-auto">
        <div className="p-8 text-center bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            {filter === "earliest"
              ? "No time slots available where everyone is free. Try a different filter or have participants adjust their availability."
              : "No time slots match this filter."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full select-none">
        <table className="border-collapse">
          <thead>
            <tr>
              <th className="w-20 p-2 text-left text-sm font-medium text-gray-700">
                Time
              </th>
              {days.map((day) => (
                <th
                  key={day}
                  className="min-w-[80px] p-2 text-center text-sm font-medium text-gray-700"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredTimeSlots.map((time) => (
              <tr key={time}>
                <td className="p-2 text-sm text-gray-600">{time}</td>
                {days.map((day) => {
                  const busyCount = getBusyCount(day, time);
                  const busyParticipants = getBusyParticipants(day, time);
                  const slotColor = getSlotColor(busyCount, totalParticipants);
                  const isAvailable = busyCount === 0;

                  return (
                    <td key={getSlotId(day, time)} className="p-1">
                      <div
                        className={`
                          w-full min-h-[40px] rounded-md flex items-center justify-center
                          ${slotColor}
                          ${isAvailable ? "font-semibold" : ""}
                          transition-colors
                        `}
                        title={
                          busyCount > 0
                            ? `${busyCount} busy: ${busyParticipants.join(
                                ", "
                              )}`
                            : "Available for everyone"
                        }
                      >
                        {busyCount > 0 && (
                          <span className="text-xs text-gray-700">
                            {busyCount}
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-available rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-200 rounded"></div>
            <span>Busy</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsGrid;
