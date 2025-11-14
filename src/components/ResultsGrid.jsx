import { useMemo } from "react";

const ResultsGrid = ({
  startTime,
  endTime,
  days,
  timeSlotDuration,
  participants,
  filter = "everything",
}) => {
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

  // Find the earliest available slot
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
  }, [timeSlots, days, participants]);

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

  const getBusyCount = (day, time) => {
    const slotId = getSlotId(day, time);
    return participants.filter((p) => p.busySlots.includes(slotId)).length;
  };

  const getBusyParticipants = (day, time) => {
    const slotId = getSlotId(day, time);
    return participants
      .filter((p) => p.busySlots.includes(slotId))
      .map((p) => p.name);
  };

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

  // Handle empty state
  if (filteredTimeSlots.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
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
    <div className="w-full h-full flex flex-col px-[2%] md:px-0">
      <div className="max-w-full md:max-w-[800px] mx-auto select-none h-full flex flex-col w-full">
        {/* Header row */}
        <div
          className="grid gap-1 mb-2 flex-shrink-0"
          style={{
            gridTemplateColumns: `minmax(50px, 0.8fr) repeat(${days.length}, minmax(40px, 1fr))`,
          }}
        >
          <div className="text-xs font-medium text-gray-700 flex items-center">
            Time
          </div>
          {days.map((day) => (
            <div
              key={day}
              className="text-xs font-medium text-gray-700 text-center"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Grid rows */}
        <div className="flex flex-col gap-1 flex-1 overflow-y-auto">
          {filteredTimeSlots.map((time) => (
            <div
              key={time}
              className="grid gap-1 flex-1 min-h-[44px]"
              style={{
                gridTemplateColumns: `minmax(50px, 0.8fr) repeat(${days.length}, minmax(40px, 1fr))`,
              }}
            >
              <div className="text-xs text-gray-600 flex items-center pr-2">
                {time}
              </div>
              {days.map((day) => {
                const busyCount = getBusyCount(day, time);
                const busyParticipants = getBusyParticipants(day, time);
                const slotColor = getSlotColor(busyCount, totalParticipants);
                const isAvailable = busyCount === 0;

                return (
                  <div key={getSlotId(day, time)} className="h-full">
                    <div
                      className={`
                        w-full h-full rounded-md flex items-center justify-center
                        ${slotColor}
                        ${isAvailable ? "font-semibold" : ""}
                        transition-colors
                      `}
                      title={
                        busyCount > 0
                          ? `${busyCount} busy: ${busyParticipants.join(", ")}`
                          : "Available for everyone"
                      }
                    >
                      {busyCount > 0 && (
                        <span className="text-xs text-gray-700">
                          {busyCount}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 text-sm flex-shrink-0">
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
