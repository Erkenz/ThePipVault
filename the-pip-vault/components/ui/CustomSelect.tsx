"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
    value: string;
    label: string;
}

interface CustomSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: Option[] | string[];
    placeholder?: string;
    className?: string;
    icon?: React.ElementType;
}

const CustomSelect = ({
    value,
    onChange,
    options,
    placeholder = "Select...",
    className,
    icon: Icon
}: CustomSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Normalize options to object format
    const formattedOptions: Option[] = options.map((opt) =>
        typeof opt === "string" ? { value: opt, label: opt } : opt
    );

    const selectedOption = formattedOptions.find((opt) => opt.value === value);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div className={cn("relative w-full", className)} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-border/50 bg-background/50 backdrop-blur-md transition-all duration-200 outline-none hover:border-primary/50 text-sm",
                    isOpen ? "border-primary ring-1 ring-primary/20 shadow-lg shadow-primary/10" : "hover:bg-background/80"
                )}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    {Icon && <Icon size={14} className="text-muted-foreground shrink-0" />}
                    <span className={cn("truncate font-medium", !selectedOption && "text-muted-foreground")}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown
                    size={14}
                    className={cn("text-muted-foreground transition-transform duration-200 shrink-0 ml-2", isOpen && "rotate-180")}
                />
            </button>

            {/* Dropdown Menu */}
            <div
                className={cn(
                    "absolute top-full left-0 w-full mt-2 p-1 rounded-xl border border-border/50 bg-background/90 backdrop-blur-xl shadow-2xl z-[100] max-h-60 overflow-y-auto custom-scrollbar origin-top transition-all duration-200",
                    isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                )}
            >
                {formattedOptions.length === 0 ? (
                    <div className="p-3 text-center text-xs text-muted-foreground italic">
                        No options available
                    </div>
                ) : (
                    formattedOptions.map((opt) => {
                        const isSelected = opt.value === value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleSelect(opt.value)}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left",
                                    isSelected
                                        ? "bg-primary/10 text-primary"
                                        : "text-foreground hover:bg-muted"
                                )}
                            >
                                <span>{opt.label}</span>
                                {isSelected && <Check size={12} className="text-primary" />}
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default CustomSelect;
