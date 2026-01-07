import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TradeList from '../TradeList'

// Define mocks
const mockUseTrades = vi.fn()
const mockUseSettings = vi.fn()
const mockUseProfile = vi.fn()

// Mock modules
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

        mockUseSettings.mockReturnValue({
            viewMode: 'pips',
            toggleViewMode: vi.fn(),
            setViewMode: vi.fn()
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
        expect(screen.getByText(/Journal Empty/i)).toBeInTheDocument()
        expect(screen.getByText(/No trades logged yet/i)).toBeInTheDocument()
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
        expect(screen.getByText('+50')).toBeInTheDocument() // Default Pips view
    })

    it('should respect viewMode="currency"', () => {
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

        mockUseSettings.mockReturnValue({
            viewMode: 'currency',
            setViewMode: vi.fn(),
            toggleViewMode: vi.fn()
        })

        render(<TradeList />)
        expect(screen.getByText('+$500.00')).toBeInTheDocument()
    })

    it('should call deleteTrade when delete button is clicked', () => {
        const mockTrades: any[] = [{
            id: '1',
            pair: 'EURUSD',
            direction: 'LONG',
            date: new Date().toISOString(),
            pnl: 0
        }]

        mockUseTrades.mockReturnValue({
            trades: mockTrades,
            deleteTrade: deleteTradeMock,
            loading: false,
            addTrade: vi.fn()
        })

        render(<TradeList />)

        // Find button clearly
        const deleteButtons = screen.getAllByRole('button')
        // Assuming the delete button is one of them. 
        // In the simplified mock environment we need to be sure. 
        // Usually TradeList has few buttons per row.
        // Let's assume the first button is delete for this trade.
        const deleteBtn = deleteButtons[0]

        fireEvent.click(deleteBtn)
        expect(deleteTradeMock).toHaveBeenCalledWith('1')
    })
})
