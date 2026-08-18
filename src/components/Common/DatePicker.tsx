import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { parseDateValue, formatDateToDMY } from '../../utils/formatters';

export interface DatePickerProps {
  id?: string;
  name?: string;
  label?: string;
  value?: string | Date | null;
  onChange: (value: string, date: Date | null) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  minDate?: Date | string;
  maxDate?: Date | string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAY_NAMES = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export default function DatePicker({
  id,
  name,
  label,
  value,
  onChange,
  placeholder = 'dd/mm/yyyy',
  required = false,
  disabled = false,
  error,
  className = '',
  minDate,
  maxDate,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Selected date object derived from prop value
  const selectedDate = parseDateValue(value);
  const parsedMin = minDate ? parseDateValue(minDate) : null;
  const parsedMax = maxDate ? parseDateValue(maxDate) : null;

  // Calendar navigation state (year and month 0-indexed)
  const today = new Date();
  const [viewYear, setViewYear] = useState<number>(() => {
    return selectedDate ? selectedDate.getFullYear() : today.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState<number>(() => {
    return selectedDate ? selectedDate.getMonth() : today.getMonth();
  });

  // Sync internal text input when external value prop changes
  useEffect(() => {
    if (value) {
      const formatted = formatDateToDMY(value);
      setInputValue(formatted || (typeof value === 'string' ? value : ''));
    } else {
      setInputValue('');
    }
  }, [value]);

  // When calendar opens or selected date changes, navigate calendar view to that date
  useEffect(() => {
    if (isOpen) {
      if (selectedDate) {
        setViewYear(selectedDate.getFullYear());
        setViewMonth(selectedDate.getMonth());
      } else {
        setViewYear(today.getFullYear());
        setViewMonth(today.getMonth());
      }
    }
  }, [isOpen]);

  // Close calendar popover on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle typing inside text input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputValue(raw);

    if (!raw.trim()) {
      onChange('', null);
      return;
    }

    const parsed = parseDateValue(raw);
    if (parsed) {
      const formatted = formatDateToDMY(parsed);
      onChange(formatted, parsed);
    } else {
      // Pass raw value so user can keep typing, but dateObj is null
      onChange(raw, null);
    }
  };

  const handleInputBlur = () => {
    if (!inputValue.trim()) {
      onChange('', null);
      return;
    }

    const parsed = parseDateValue(inputValue);
    if (parsed) {
      const formatted = formatDateToDMY(parsed);
      setInputValue(formatted);
      onChange(formatted, parsed);
    }
  };

  const handleSelectDate = (date: Date) => {
    const formatted = formatDateToDMY(date);
    setInputValue(formatted);
    onChange(formatted, date);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInputValue('');
    onChange('', null);
  };

  const handleToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    handleSelectDate(now);
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Generate calendar days grid (Monday start)
  const getCalendarDays = () => {
    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      isSelected: boolean;
      isToday: boolean;
      isDisabled: boolean;
    }> = [];

    // First day of current view month
    const firstDay = new Date(viewYear, viewMonth, 1);
    // Total days in current month
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    // Day of week for 1st day (0 = Sun, 1 = Mon, ..., 6 = Sat)
    // Convert to 0 = Mon, 6 = Sun
    const dayOfWeek = (firstDay.getDay() + 6) % 7;

    // Previous month padding days
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
    for (let i = dayOfWeek - 1; i >= 0; i--) {
      const date = new Date(viewYear, viewMonth - 1, prevMonthDays - i);
      days.push({
        date,
        isCurrentMonth: false,
        isSelected: isSameDay(date, selectedDate),
        isToday: isSameDay(date, today),
        isDisabled: isDateDisabled(date),
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      days.push({
        date,
        isCurrentMonth: true,
        isSelected: isSameDay(date, selectedDate),
        isToday: isSameDay(date, today),
        isDisabled: isDateDisabled(date),
      });
    }

    // Next month padding days to complete 6-row or 5-row grid
    const totalCells = days.length <= 35 ? 35 : 42;
    const remaining = totalCells - days.length;
    for (let n = 1; n <= remaining; n++) {
      const date = new Date(viewYear, viewMonth + 1, n);
      days.push({
        date,
        isCurrentMonth: false,
        isSelected: isSameDay(date, selectedDate),
        isToday: isSameDay(date, today),
        isDisabled: isDateDisabled(date),
      });
    }

    return days;
  };

  const isSameDay = (d1: Date, d2?: Date | null) => {
    if (!d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isDateDisabled = (date: Date) => {
    if (parsedMin && date < parsedMin) return true;
    if (parsedMax && date > parsedMax) return true;
    return false;
  };

  // Generate list of years for quick dropdown (e.g. 2000 to current + 15)
  const currentYear = today.getFullYear();
  const yearOptions: number[] = [];
  for (let y = currentYear - 20; y <= currentYear + 15; y++) {
    yearOptions.push(y);
  }

  const generatedId = id || (name ? `datepicker-${name.replace(/\s+/g, '-').toLowerCase()}` : undefined);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label
          htmlFor={generatedId}
          className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider mb-1.5"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <input
          id={generatedId}
          name={name}
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onClick={() => !disabled && setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full pl-3.5 pr-16 py-2 bg-white border rounded-lg text-[#1A1A1A] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5A5A40] transition-colors placeholder:text-[#A0A090] ${
            error
              ? 'border-red-400 focus:ring-red-400'
              : 'border-[#E0E0D5] hover:border-[#C0C0B0]'
          } ${disabled ? 'bg-[#F5F5F0] text-[#8A8A7A] cursor-not-allowed' : 'cursor-text'}`}
        />

        <div className="absolute right-2 flex items-center gap-1 text-[#6A6A58]">
          {inputValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-[#8A8A7A] hover:text-[#3D3D2D] hover:bg-[#F0F0E8] rounded-md transition-colors"
              title="Clear date"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => !disabled && setIsOpen((prev) => !prev)}
            disabled={disabled}
            className={`p-1.5 text-[#5A5A40] hover:bg-[#F0F0E8] rounded-md transition-colors focus:outline-hidden ${
              isOpen ? 'bg-[#ECECE2]' : ''
            }`}
            title="Open calendar"
          >
            <CalendarIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      {/* Calendar Dropdown Popover */}
      {isOpen && !disabled && (
        <div
          id={`${generatedId}-calendar-popover`}
          className="absolute z-50 mt-1.5 w-72 bg-white border border-[#E0E0D5] rounded-xl shadow-xl p-3 animate-in fade-in zoom-in-95 duration-100"
          style={{ minWidth: '280px' }}
        >
          {/* Calendar Header with Month/Year Navigation */}
          <div className="flex items-center justify-between gap-1 mb-2 pb-2 border-b border-[#F0F0E5]">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-[#5A5A40] hover:bg-[#F4F4EE] active:scale-95 transition-all"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5">
              {/* Month Selector */}
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                className="text-xs font-bold text-[#2A2A20] bg-[#F7F7F2] hover:bg-[#EFEFE8] border border-[#E0E0D5] rounded-md px-2 py-1 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx}>
                    {name}
                  </option>
                ))}
              </select>

              {/* Year Selector */}
              <select
                value={viewYear}
                onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                className="text-xs font-bold text-[#2A2A20] bg-[#F7F7F2] hover:bg-[#EFEFE8] border border-[#E0E0D5] rounded-md px-2 py-1 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
              >
                {yearOptions.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-[#5A5A40] hover:bg-[#F4F4EE] active:scale-95 transition-all"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekdays Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEKDAY_NAMES.map((wd) => (
              <span
                key={wd}
                className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A7A] py-1"
              >
                {wd}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {getCalendarDays().map((cell, idx) => {
              const dateKey = `${cell.date.getFullYear()}-${cell.date.getMonth()}-${cell.date.getDate()}-${idx}`;

              let btnClasses =
                'h-7 w-7 mx-auto rounded-lg text-xs flex items-center justify-center font-medium transition-all select-none ';

              if (cell.isDisabled) {
                btnClasses += 'text-[#C5C5B5] cursor-not-allowed';
              } else if (cell.isSelected) {
                btnClasses +=
                  'bg-[#5A5A40] text-white font-bold shadow-xs active:scale-95';
              } else if (cell.isToday) {
                btnClasses +=
                  'border border-[#5A5A40] text-[#3D3D2D] font-bold hover:bg-[#F4F4EE] active:scale-95';
              } else if (cell.isCurrentMonth) {
                btnClasses +=
                  'text-[#2A2A20] hover:bg-[#F4F4EE] active:scale-95';
              } else {
                btnClasses +=
                  'text-[#A5A595] hover:bg-[#F9F9F5] active:scale-95';
              }

              return (
                <button
                  key={dateKey}
                  type="button"
                  disabled={cell.isDisabled}
                  onClick={() => !cell.isDisabled && handleSelectDate(cell.date)}
                  className={btnClasses}
                >
                  {cell.date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Footer Quick Actions */}
          <div className="mt-2.5 pt-2 border-t border-[#F0F0E5] flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleToday}
              className="font-semibold text-[#5A5A40] hover:text-[#3D3D2D] hover:underline px-1 py-0.5"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="text-[#8A8A7A] hover:text-red-600 hover:underline px-1 py-0.5"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
