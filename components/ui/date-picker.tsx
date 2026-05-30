import * as React from "react"

export interface DatePickerProps {
    date?: Date | null
    onDateChange?: (date?: Date | null) => void
    placeholder?: string
}

export function DatePicker({ date, onDateChange, placeholder }: DatePickerProps) {
    // Convert to strict YYYY-MM-DD for native input compatibility if date exists
    const formattedDate = date ? date.toISOString().split('T')[0] : '';

    return (
        <div className="relative w-full">
            <input
                type="date"
                value={formattedDate}
                placeholder={placeholder}
                min={new Date().toISOString().split('T')[0]} // Optional: Prevents past dates for promos 
                onChange={(e) => {
                    if (e.target.value) {
                        const newDate = new Date(e.target.value);
                        if (onDateChange) onDateChange(newDate);
                    } else {
                        if (onDateChange) onDateChange(null);
                    }
                }}
                // Styling that perfectly mirrors your stone-900 inputs
                className="w-full p-2.5 bg-stone-800 border-none rounded-md text-white text-[13px] focus:outline-none focus:ring-0 [&::-webkit-calendar-picker-indicator]:invert-[0.8] cursor-pointer"
                style={{ colorScheme: 'dark' }} // Forces the native datepicker modal to be dark!
            />
        </div>
    )
}
