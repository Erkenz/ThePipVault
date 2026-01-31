import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AddTradeModal from '../AddTradeModal'

// Mock Contexts
const mockAddTrade = vi.fn()
const mockUseTrades = vi.fn()
const mockUseProfile = vi.fn()

vi.mock('@/context/TradeContext', () => ({
    useTrades: () => mockUseTrades()
}))

vi.mock('@/context/ProfileContext', () => ({
    useProfile: () => mockUseProfile()
}))

// Mock trade object for edit tests
const mockTrade = {
    id: '123',
    pair: 'USDJPY',
    direction: 'SHORT',
    entryPrice: 150.00,
    stopLoss: 150.50,
    takeProfit: 149.00,
    volume: 1,
    pnl: 100,
    pnl_currency: 105, // Gross
    commission: 5,
    swap: 0,
    date: '2023-01-01T10:00:00Z',
    user_id: 'uid',
    session: 'London'
}

describe('AddTradeModal', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        mockUseTrades.mockReturnValue({
            addTrade: mockAddTrade
        })

        mockUseProfile.mockReturnValue({
            profile: {
                sessions: ['London', 'New York'],
                strategies: ['Breakout', 'Reversal']
            }
        })
    })

    it('should not render when isOpen is false', () => {
        render(<AddTradeModal isOpen={false} onClose={vi.fn()} />)
        expect(screen.queryByText('Log New Trade')).not.toBeInTheDocument()
    })

    it('should render correct fields when open', () => {
        render(<AddTradeModal isOpen={true} onClose={vi.fn()} />)
        expect(screen.getByText('Log New Trade')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('EURUSD')).toBeInTheDocument()
        expect(screen.getByText('London')).toBeInTheDocument()
        expect(screen.getByText('Breakout')).toBeInTheDocument()
    })

    it('should validate inputs before saving', async () => {
        render(<AddTradeModal isOpen={true} onClose={vi.fn()} />)

        const saveBtn = screen.getByRole('button', { name: /save trade/i })
        fireEvent.click(saveBtn)

        await waitFor(() => {
            expect(screen.getByText(/Please fill in required fields/i)).toBeInTheDocument()
            expect(mockAddTrade).not.toHaveBeenCalled()
        })
    })

    it('should calculate Planned and Realized RR', async () => {
        const onClose = vi.fn()
        render(<AddTradeModal isOpen={true} onClose={onClose} />)

        // Fill Form
        fireEvent.change(screen.getByPlaceholderText('EURUSD'), { target: { value: 'GBPUSD' } })
        fireEvent.change(screen.getByLabelText(/Entry/i), { target: { value: '1.2000' } })
        fireEvent.change(screen.getByLabelText(/Stop Loss/i), { target: { value: '1.1980' } }) // 20 pips risk
        fireEvent.change(screen.getByLabelText(/Take Profit/i), { target: { value: '1.2040' } }) // 40 pips reward

        // Check Planned RR (2.00)
        await waitFor(() => {
            expect(screen.getByText('2')).toBeInTheDocument()
        })

        // Enter Exit Price for Realized RR
        fireEvent.change(screen.getByLabelText(/Exit Price/i), { target: { value: '1.2060' } }) // 60 pips realized

        // Check Realized RR (3.00)
        await waitFor(() => {
            expect(screen.getByText('3R')).toBeInTheDocument()
        })
    })

    it('should calculate RR and Save trade', async () => {
        const onClose = vi.fn()
        render(<AddTradeModal isOpen={true} onClose={onClose} />)

        // Fill Form using document selectors (Portal)
        const pair = document.querySelector('input[name="pair"]')
        const entry = document.querySelector('input[name="entryPrice"]')
        const sl = document.querySelector('input[name="stopLoss"]')
        const tp = document.querySelector('input[name="takeProfit"]')
        const date = document.querySelector('input[name="date"]')

        if (!pair || !entry || !sl || !tp || !date) throw new Error("Inputs not found")

        fireEvent.change(pair, { target: { value: 'GBPUSD' } })
        fireEvent.change(entry, { target: { value: '1.2000' } })
        fireEvent.change(sl, { target: { value: '1.1980' } }) // 20 pips risk
        fireEvent.change(tp, { target: { value: '1.2040' } }) // 40 pips reward
        fireEvent.change(date, { target: { value: '2023-01-01T10:00' } })

        // Explicitly select session (required because isOpen=true skips effect init)
        fireEvent.click(screen.getByText('London'))

        // Check RR Calculation (Risk 20, Reward 40 => 2.00)
        await waitFor(() => {
            expect(screen.getByText('2')).toBeInTheDocument()
        })

        // Save
        const saveBtn = screen.getByRole('button', { name: /save trade/i })
        fireEvent.click(saveBtn)

        await waitFor(() => {
            expect(mockAddTrade).toHaveBeenCalled()
            expect(screen.getByText('Trade Saved')).toBeInTheDocument()
        })
    })

    it('should close modal on X click', () => {
        const onClose = vi.fn()
        render(<AddTradeModal isOpen={true} onClose={onClose} />)

        const closeBtn = screen.getByRole('button', { name: /close modal/i })
        fireEvent.click(closeBtn)

        expect(onClose).toHaveBeenCalled()
    })

    it('should populate form when editing a trade', () => {
        render(<AddTradeModal isOpen={true} onClose={vi.fn()} tradeToEdit={mockTrade as any} />)

        expect(screen.getByDisplayValue('USDJPY')).toBeInTheDocument()
        expect(screen.getByDisplayValue('150')).toBeInTheDocument()
    })

    it('should calculate Net PnL correctly', async () => {
        render(<AddTradeModal isOpen={true} onClose={vi.fn()} />)

        // Use name attribute selectors on document because of Portal
        const gross = document.querySelector('input[name="grossPnl"]')
        const comm = document.querySelector('input[name="commission"]')
        const swap = document.querySelector('input[name="swap"]')

        if (!gross || !comm || !swap) throw new Error("PnL inputs not found")

        fireEvent.change(gross, { target: { value: '100' } })
        fireEvent.change(comm, { target: { value: '5.50' } })
        fireEvent.change(swap, { target: { value: '2.50' } })

        // 100 - 5.5 - 2.5 = 92.00
        await waitFor(() => {
            expect(screen.getByText('$92.00')).toBeInTheDocument()
        })
    })

    it('should handle save errors gracefully', async () => {
        mockAddTrade.mockRejectedValue(new Error('Database error'))
        render(<AddTradeModal isOpen={true} onClose={vi.fn()} />)

        // Fill required using document selectors
        const pair = document.querySelector('input[name="pair"]')
        const entry = document.querySelector('input[name="entryPrice"]')
        const date = document.querySelector('input[name="date"]')

        if (!pair || !entry || !date) throw new Error("Inputs not found")

        fireEvent.change(pair, { target: { value: 'GBPUSD' } })
        fireEvent.change(entry, { target: { value: '1.2000' } })
        fireEvent.change(date, { target: { value: '2023-01-01T10:00' } })

        // Select session (required)
        fireEvent.click(screen.getByText('London'))

        // Save
        const saveBtn = screen.getByRole('button', { name: /save trade/i })
        fireEvent.click(saveBtn)

        await waitFor(() => {
            expect(screen.getByText(/Database error/i)).toBeInTheDocument()
        })
    })
})
