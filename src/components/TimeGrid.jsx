import { useMemo, useState, useRef } from "react";

const TimeGrid = ({
  startTime,
  endTime,
  days,
  timeSlotDuration,
  busySlots = [],
  onSlotToggle,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState(null); // 'add' or 'remove'
  const draggedSlots = useRef(new Set());

  // Generate time slots between startTime and endTime
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

  // Generate slot ID: "day-time"
  const getSlotId = (day, time) => `${day}-${time}`;

  // Check if a slot is busy
  const isBusy = (day, time) => {
    const slotId = getSlotId(day, time);
    return busySlots.includes(slotId);
  };

  // Handle mouse down - start dragging
  const handleMouseDown = (day, time) => {
    setIsDragging(true);
    const slotId = getSlotId(day, time);
    const currentlyBusy = busySlots.includes(slotId);

    // If currently busy, we're in "remove" mode, otherwise "add" mode
    setDragMode(currentlyBusy ? "remove" : "add");

    draggedSlots.current = new Set([slotId]);
    onSlotToggle(slotId);
  };

  // Handle mouse enter - continue dragging
  const handleMouseEnter = (day, time) => {
    if (!isDragging) return;

    const slotId = getSlotId(day, time);

    // Only toggle if we haven't already toggled this slot in this drag
    if (!draggedSlots.current.has(slotId)) {
      draggedSlots.current.add(slotId);

      const currentlyBusy = busySlots.includes(slotId);

      // Only toggle if it matches our drag mode
      if (dragMode === "add" && !currentlyBusy) {
        onSlotToggle(slotId);
      } else if (dragMode === "remove" && currentlyBusy) {
        onSlotToggle(slotId);
      }
    }
  };

  // Handle mouse up - stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
    setDragMode(null);
    draggedSlots.current.clear();
  };

  return (
    <div
      className="overflow-x-auto"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
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
            {timeSlots.map((time) => (
              <tr key={time}>
                <td className="p-2 text-sm text-gray-600">{time}</td>
                {days.map((day) => {
                  const slotId = getSlotId(day, time);
                  const busy = isBusy(day, time);

                  return (
                    <td key={slotId} className="p-1">
                      <button
                        onMouseDown={() => handleMouseDown(day, time)}
                        onMouseEnter={() => handleMouseEnter(day, time)}
                        className={`
                          w-full min-h-[40px] rounded-md transition-colors
                          ${
                            busy
                              ? "bg-busy hover:bg-red-600"
                              : "bg-empty hover:bg-gray-300"
                          }
                          cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-1
                        `}
                        aria-label={`${day} ${time} - ${
                          busy ? "busy" : "available"
                        }`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TimeGrid;
