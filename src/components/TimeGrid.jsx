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
  const [dragMode, setDragMode] = useState(null);
  const draggedSlots = useRef(new Set());

  // Generate time slots (keep existing logic)
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

  const getSlotId = (day, time) => `${day}-${time}`;
  const isBusy = (day, time) => busySlots.includes(getSlotId(day, time));

  const handleMouseDown = (day, time) => {
    setIsDragging(true);
    const slotId = getSlotId(day, time);
    const currentlyBusy = busySlots.includes(slotId);
    setDragMode(currentlyBusy ? "remove" : "add");
    draggedSlots.current = new Set([slotId]);
    onSlotToggle(slotId);
  };

  const handleMouseEnter = (day, time) => {
    if (!isDragging) return;
    const slotId = getSlotId(day, time);
    if (!draggedSlots.current.has(slotId)) {
      draggedSlots.current.add(slotId);
      const currentlyBusy = busySlots.includes(slotId);
      if (dragMode === "add" && !currentlyBusy) {
        onSlotToggle(slotId);
      } else if (dragMode === "remove" && currentlyBusy) {
        onSlotToggle(slotId);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragMode(null);
    draggedSlots.current.clear();
  };

  const handleTouchStart = (e, day, time) => {
    e.preventDefault();
    setIsDragging(true);
    const slotId = getSlotId(day, time);
    const currentlyBusy = busySlots.includes(slotId);
    setDragMode(currentlyBusy ? "remove" : "add");
    draggedSlots.current = new Set([slotId]);
    onSlotToggle(slotId);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);

    if (element && element.dataset.slotId) {
      const slotId = element.dataset.slotId;

      if (!draggedSlots.current.has(slotId)) {
        draggedSlots.current.add(slotId);
        const currentlyBusy = busySlots.includes(slotId);

        if (dragMode === "add" && !currentlyBusy) {
          onSlotToggle(slotId);
        } else if (dragMode === "remove" && currentlyBusy) {
          onSlotToggle(slotId);
        }
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setDragMode(null);
    draggedSlots.current.clear();
  };

  return (
    <div
      className="w-full h-full flex flex-col px-[2%] md:px-0"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Container with max-width */}
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

        {/* Grid rows - flex container that grows */}
        <div className="flex flex-col gap-1 flex-1 overflow-y-auto">
          {timeSlots.map((time) => (
            <div
              key={time}
              className="grid gap-1 flex-1 min-h-[44px]"
              style={{
                gridTemplateColumns: `minmax(50px, 0.8fr) repeat(${days.length}, minmax(40px, 1fr))`,
              }}
            >
              {/* Time label */}
              <div className="text-xs text-gray-600 flex items-center pr-2">
                {time}
              </div>

              {/* Day cells */}
              {days.map((day) => {
                const busy = isBusy(day, time);
                return (
                  <button
                    key={getSlotId(day, time)}
                    data-slot-id={getSlotId(day, time)}
                    onMouseDown={() => handleMouseDown(day, time)}
                    onMouseEnter={() => handleMouseEnter(day, time)}
                    onTouchStart={(e) => handleTouchStart(e, day, time)}
                    className={`
              h-full w-full rounded-md transition-colors
              ${
                busy ? "bg-busy hover:bg-red-600" : "bg-empty hover:bg-gray-300"
              }
              cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-1
              touch-manipulation
            `}
                    aria-label={`${day} ${time} - ${
                      busy ? "busy" : "available"
                    }`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimeGrid;
