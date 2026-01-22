import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import Home from '../page'

// --- MOCK CHILD COMPONENTS ---
vi.mock('@/components/dashboard/ProfitsCard', () => ({
    default: ({ title, value, subValue }: any) => (
        <div data-testid="profit-card">
            <div data-testid="pc-title">{title}</div>
            <div data-testid="pc-value">{value}</div>
            <div data-testid="pc-sub">{subValue}</div>
        </div>
    )
}))

vi.mock('@/components/dashboard/EquityChart', () => ({
    default: ({ trades }: any) => <div data-testid="equity-chart">Trades: {trades.length}</div>
}))

vi.mock('@/components/dashboard/TradingCalendar', () => ({
    default: ({ trades }: any) => <div data-testid="trading-calendar">Calendar: {trades.length}</div>
}))

vi.mock('@/components/dashboard/ViewToggle', () => ({
    default: () => <div data-testid="view-toggle">Toggle</div>
}))

vi.mock('@/components/dashboard/SetupBreakdown', () => ({
    default: () => <div data-testid="setup-breakdown">Setups</div>
}))

vi.mock('@/components/dashboard/EmotionAnalysis', () => ({
    default: () => <div data-testid="emotion-analysis">Emotions</div>
}))

// --- MOCK HOOKS ---
const mockUseTrades = vi.fn()
const mockUseSettings = vi.fn()
const mockUseProfile = vi.fn()

vi.mock('@/context/TradeContext', () => ({
    useTrades: () => mockUseTrades()
}))
vi.mock('@/context/SettingsContext', () => ({
    useSettings: () => mockUseSettings()
}))
vi.mock('@/context/ProfileContext', () => ({
    useProfile: () => mockUseProfile()
}))

describe('Dashboard Page', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        mockUseTrades.mockReturnValue({
            trades: [],
            loading: false,
        })
        mockUseSettings.mockReturnValue({
            viewMode: 'pips',
        })
        mockUseProfile.mockReturnValue({
            profile: { starting_equity: 10000 },
        })
    })

    it('should calculate and pass correct stats (Pips Mode)', async () => {
        const mockTrades = [{
            id: 't1',
            pnl: 10,
            pnl_currency: 100,
            date: new Date().toISOString()
        }]

        mockUseTrades.mockReturnValue({
            trades: mockTrades,
            loading: false,
        })

        render(<Home />)

        await waitFor(() => {
            const titles = screen.getAllByTestId('pc-title')
            const values = screen.getAllByTestId('pc-value')

            // Find the "Net PnL" card
            const pnlIndex = titles.findIndex(el => el.textContent === 'Net PnL')
            expect(pnlIndex).not.toBe(-1)

            // Value should contain "+10"
            expect(values[pnlIndex]).toHaveTextContent('+10')
        })
    })

    it('should calculate and pass correct stats (Currency Mode)', async () => {
        const mockTrades = [{
            id: 't1',
            pnl: 10,
            pnl_currency: 100,
            date: new Date().toISOString()
        }]

        mockUseTrades.mockReturnValue({
            trades: mockTrades,
            loading: false,
        })

        mockUseSettings.mockReturnValue({
            viewMode: 'currency',
        })

        render(<Home />)

        await waitFor(() => {
            const titles = screen.getAllByTestId('pc-title')
            const values = screen.getAllByTestId('pc-value')

            const pnlIndex = titles.findIndex(el => el.textContent === 'Net PnL')
            // Should be "+$100" or similar
            expect(values[pnlIndex]).toHaveTextContent('100')
            expect(values[pnlIndex].textContent).toContain('$')
        })
    })

    it('should calculate and pass correct stats (Percentage Mode)', async () => {
        const mockTrades = [{
            id: 't1',
            pnl: 10,
            pnl_currency: 100,
            date: new Date().toISOString()
        }]

        mockUseTrades.mockReturnValue({
            trades: mockTrades,
            loading: false,
        })

        mockUseProfile.mockReturnValue({
            profile: { starting_equity: 10000 },
        })

        mockUseSettings.mockReturnValue({
            viewMode: 'percentage',
        })

        render(<Home />)

        await waitFor(() => {
            const titles = screen.getAllByTestId('pc-title')
            const values = screen.getAllByTestId('pc-value')

            // Title changes to "Return" in percentage mode
            const returnIndex = titles.findIndex(el => el.textContent === 'Return')
            expect(returnIndex).not.toBe(-1)

            // Value should be "+1%"
            expect(values[returnIndex]).toHaveTextContent('1%')
        })
    })
})
