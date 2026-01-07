import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import TradingCalendar from '../TradingCalendar'

// Mock dependencies
const mockUseSettings = vi.fn()
const mockUseProfile = vi.fn()

vi.mock('@/context/SettingsContext', () => ({
    useSettings: () => mockUseSettings()
}))

vi.mock('@/context/ProfileContext', () => ({
    useProfile: () => mockUseProfile()
}))

describe('TradingCalendar', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockUseSettings.mockReturnValue({ viewMode: 'pips' })
        mockUseProfile.mockReturnValue({ profile: { starting_equity: 10000 } })
    })

    it('should render calendar header', () => {
        render(<TradingCalendar trades={[]} />)
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        const currentMonth = months[new Date().getMonth()]
        expect(screen.getByText(new RegExp(currentMonth))).toBeInTheDocument()
        expect(screen.getByText('Today')).toBeInTheDocument()
    })

    it('should render trades on correct days', () => {
        const today = new Date().toISOString()
        const mockTrades: any[] = [{
            id: '1',
            date: today,
            pnl: 50,
            pnl_currency: 100
        }]

        render(<TradingCalendar trades={mockTrades} />)
        // Should show trade count
        expect(screen.getByText('1x')).toBeInTheDocument()
        // Should show PnL
        expect(screen.getByText('+50')).toBeInTheDocument()
    })
})
