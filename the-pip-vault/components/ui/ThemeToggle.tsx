"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // useEffect only runs on the client, so now we can safely show the UI
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <button className="p-2 rounded-lg text-pip-muted opacity-50 cursor-pointer">
                <Sun className="h-[1.2rem] w-[1.2rem]" />
            </button>
        )
    }

    return (
        <button
            onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
            className="p-2 rounded-lg text-pip-muted hover:bg-pip-active transition-colors cursor-pointer"
            title={resolvedTheme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
            {resolvedTheme === "light" ? (
                <Sun className="h-[1.2rem] w-[1.2rem] text-pip-gold" style={{ color: '#d4af37' }} />
            ) : (
                <Moon className="h-[1.2rem] w-[1.2rem] text-pip-muted hover:text-pip-text" />
            )}
            <span className="sr-only">Toggle theme</span>
        </button>
    )
}
