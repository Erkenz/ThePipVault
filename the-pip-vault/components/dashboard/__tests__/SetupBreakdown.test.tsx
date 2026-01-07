import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import SetupBreakdown from '../SetupBreakdown'

const mockUseSettings = vi.fn()
const mockUseProfile = vi.fn()

vi.mock('@/context/SettingsContext', () => ({
    useSettings: () => mockUseSettings()
}))
vi.mock('@/context/ProfileContext', () => ({
    useProfile: () => mockUseProfile()
}))

describe('SetupBreakdown', () => {
    beforeEach(() => {
        mockUseSettings.mockReturnValue({ viewMode: 'pips' })
        mockUseProfile.mockReturnValue({ profile: { starting_equity: 10000 } })
    })

    it('should render empty state', () => {
        render(<SetupBreakdown trades={[]} />)
        expect(screen.getByText('No setup data available.')).toBeInTheDocument()
    })

    it('should render setup stats', () => {
        const mockTrades: any[] = [{
            id: '1',
            setup: 'Breakout',
            pnl: 20,
            pnl_currency: 40
        }]
        render(<SetupBreakdown trades={mockTrades} />)
        expect(screen.getByText('Breakout')).toBeInTheDocument()
        expect(screen.getByText(/1 trades/)).toBeInTheDocument()
        expect(screen.getByText('+20.00 pips')).toBeInTheDocument()
    })
})
