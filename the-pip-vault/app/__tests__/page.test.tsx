import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import Home from '../page'

// --- MOCK CHILD COMPONENTS ---
// Note: ProfitCard is not used in the page currently, keeping explicit mocks for other used components
vi.mock('@/components/dashboard/EquityChart', () => ({
    default: ({ trades }: any) => <div data-testid="equity-chart">Trades: {trades.length}</div>
}))

vi.mock('@/components/dashboard/TradingCalendar', () => ({
    default: ({ trades }: any) => <div data-testid="trading-calendar">Calendar: {trades.length}</div>
}))

vi.mock('@/components/dashboard/SetupBreakdown', () => ({
    default: () => <div data-testid="setup-breakdown">Setups</div>
}))

vi.mock('@/components/dashboard/EmotionAnalysis', () => ({
    default: () => <div data-testid="emotion-analysis">Emotions</div>
}))

// --- MOCK HOOKS ---
const mockUseTrades = vi.fn()
const mockUseProfile = vi.fn()

vi.mock('@/context/TradeContext', () => ({
    useTrades: () => mockUseTrades()
}))
// SettingsContext is no longer used in Home
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
        mockUseProfile.mockReturnValue({
            profile: { starting_equity: 10000, first_name: 'TestUser' },
        })
    })

    it('should display correct stats in Currency ($) mode always', async () => {
        const mockTrades = [{
            id: 't1',
            pnl: 10, // pips (should be ignored)
            pnl_currency: 100, // currency (should be used)
            date: new Date().toISOString()
        }]

        mockUseTrades.mockReturnValue({
            trades: mockTrades,
            loading: false,
        })

        render(<Home />)

        await waitFor(() => {
            // Check for Net PnL text and value
            expect(screen.getByText('Net PnL')).toBeInTheDocument()

            // The value should be formatted with $
            const pnlValue = screen.getByText((content, element) => {
                return element?.tagName.toLowerCase() === 'div' && content.includes('$100');
            })
            expect(pnlValue).toBeInTheDocument()
            expect(pnlValue).toHaveTextContent('+$100')
        })
    })

    it('should display loading state', () => {
        mockUseTrades.mockReturnValue({
            trades: [],
            loading: true,
        })

        render(<Home />)
        expect(screen.getByText(/Loading Dashboard/i)).toBeInTheDocument()
    })
})
