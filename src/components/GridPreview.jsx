import { useMemo } from "react";

const GridPreview = ({ startTime, endTime, days, timeSlotDuration }) => {
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

  if (days.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        Select at least one day to see preview
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-full mx-auto">
        {/* Header row */}
        <div
          className="grid gap-1 mb-2"
          style={{
            gridTemplateColumns: `minmax(50px, 0.8fr) repeat(${days.length}, minmax(40px, 1fr))`,
          }}
        >
          <div className="text-xs font-medium text-gray-700">Time</div>
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
        <div className="flex flex-col gap-1 max-h-[400px] overflow-y-auto">
          {timeSlots.map((time) => (
            <div
              key={time}
              className="grid gap-1"
              style={{
                gridTemplateColumns: `minmax(50px, 0.8fr) repeat(${days.length}, minmax(40px, 1fr))`,
              }}
            >
              <div className="text-xs text-gray-600 flex items-center">
                {time}
              </div>
              {days.map((day) => (
                <div
                  key={`${day}-${time}`}
                  className="h-8 bg-gray-100 rounded"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GridPreview;
