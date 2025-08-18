import React, { useState, useEffect } from "react";

const CustomDatePicker = ({ fromDate, onSelect }) => {
  const today = new Date();
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [daysInMonth, setDaysInMonth] = useState([]);

  useEffect(() => {
    if (year && month) {
      const numDays = new Date(year, month, 0).getDate();
      const dayList = Array.from({ length: numDays }, (_, i) => i + 1);
      setDaysInMonth(dayList);
    } else {
      setDaysInMonth([]);
    }
    setDay("");
  }, [year, month]);

  const handleDaySelect = (selectedDay) => {
    setDay(selectedDay);
    const selectedDate = new Date(year, month - 1, selectedDay);
    if (fromDate && new Date(fromDate) > selectedDate) {
      alert("To Date should be after From Date");
      return;
    }
    const isoDate = selectedDate.toISOString().split("T")[0];
    onSelect(isoDate);
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Year dropdown */}
      <select
        value={year}
        onChange={(e) => setYear(e.target.value)}
        className="px-3 py-2 border rounded-md text-sm text-gray-700"
      >
        <option value="">Year</option>
        {Array.from({ length: 10 }, (_, i) => today.getFullYear() - i).map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      {/* Month dropdown */}
      <select
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        className="px-3 py-2 border rounded-md text-sm text-gray-700"
      >
        <option value="">Month</option>
        {Array.from({ length: 12 }, (_, i) => (
          <option key={i + 1} value={i + 1}>
            {new Date(0, i).toLocaleString("default", { month: "short" })}
          </option>
        ))}
      </select>

      {/* Day dropdown */}
      <select
        value={day}
        onChange={(e) => handleDaySelect(e.target.value)}
        className="px-3 py-2 border rounded-md text-sm text-gray-700"
        disabled={!year || !month}
      >
        <option value="">Day</option>
        {daysInMonth.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
    </div>
  );
};

export default CustomDatePicker;
