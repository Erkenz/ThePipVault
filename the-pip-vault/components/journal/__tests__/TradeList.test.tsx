import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TradeList from '../TradeList'

// ... (mocks remain same)



// Define mocks
const mockUseTrades = vi.fn()
const mockUseSettings = vi.fn()
const mockUseProfile = vi.fn()

// Mock modules
vi.mock('sweetalert2', () => ({
    default: {
        fire: vi.fn().mockResolvedValue({ isConfirmed: true })
    }
}))

vi.mock('sweetalert2-react-content', () => ({
    default: (fn: any) => fn
}))

import Swal from 'sweetalert2'

vi.mock('@/context/TradeContext', () => ({
    useTrades: () => mockUseTrades(),
    Trade: {}
}))
vi.mock('@/context/SettingsContext', () => ({
    useSettings: () => mockUseSettings()
}))
vi.mock('@/context/ProfileContext', () => ({
    useProfile: () => mockUseProfile()
}))

describe('TradeList', () => {
    const deleteTradeMock = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()

        // Default Context Mocks
        mockUseTrades.mockReturnValue({
            trades: [],
            deleteTrade: deleteTradeMock,
            loading: false,
            addTrade: vi.fn()
        })



        mockUseProfile.mockReturnValue({
            profile: { starting_equity: 10000 },
            updateProfile: vi.fn(),
            loading: false,
            resetTradesOnly: vi.fn(),
            resetSettingsOnly: vi.fn(),
            resetFullAccount: vi.fn()
        })
    })

    it('should show loading state', () => {
        mockUseTrades.mockReturnValue({
            trades: [],
            deleteTrade: deleteTradeMock,
            loading: true,
            addTrade: vi.fn()
        })

        const { container } = render(<TradeList />)
        expect(container.getElementsByClassName('animate-pulse').length).toBeGreaterThan(0)
    })

    it('should show empty state when no trades', () => {
        render(<TradeList />)
        expect(screen.getByText(/No Trades Found/i)).toBeInTheDocument()
    })

    it('should render trades correctly', () => {
        const mockTrades: any[] = [{
            id: '1',
            pair: 'EURUSD',
            direction: 'LONG',
            date: new Date().toISOString(),
            entryPrice: 1.1000,
            stopLoss: 1.0950,
            pnl: 50,
            pnl_currency: 500,
            emotion: 'Confident'
        }]

        mockUseTrades.mockReturnValue({
            trades: mockTrades,
            deleteTrade: deleteTradeMock,
            loading: false,
            addTrade: vi.fn()
        })

        render(<TradeList />)
        expect(screen.getByText('EURUSD')).toBeInTheDocument()
        expect(screen.getByText('+$500.00')).toBeInTheDocument() // Currency view always

        // Verify new layout labels
        expect(screen.getByText('ENTRY')).toBeInTheDocument()
        expect(screen.getByText('SL')).toBeInTheDocument()
        expect(screen.getByText('TP')).toBeInTheDocument()
        expect(screen.getByText('EXIT')).toBeInTheDocument()
    })

    it('should respect viewMode="currency" (now default)', () => {
        const mockTrades: any[] = [{
            id: '1',
            pair: 'EURUSD',
            direction: 'LONG',
            date: new Date().toISOString(),
            pnl: 50,
            pnl_currency: 500,
        }]

        mockUseTrades.mockReturnValue({
            trades: mockTrades,
            deleteTrade: deleteTradeMock,
            loading: false,
            addTrade: vi.fn()
        })

        render(<TradeList />)
        expect(screen.getByText('+$500.00')).toBeInTheDocument()
    })

    it('should call deleteTrade when delete button is clicked and confirmed', async () => {
        const mockTrades: any[] = [{
            id: '1',
            pair: 'EURUSD',
            direction: 'LONG',
            date: new Date().toISOString(),
            pnl: 0,
            pnl_currency: 0
        }]

        mockUseTrades.mockReturnValue({
            trades: mockTrades,
            deleteTrade: deleteTradeMock,
            loading: false,
            addTrade: vi.fn()
        })

        render(<TradeList />)

        const deleteBtn = screen.getByRole('button', { name: /delete trade/i })
        fireEvent.click(deleteBtn)

        expect(Swal.fire).toHaveBeenCalled()

        await waitFor(() => {
            expect(deleteTradeMock).toHaveBeenCalledWith('1')
        })
    })
})
