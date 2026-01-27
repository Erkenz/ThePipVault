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

        const saveBtn = screen.getByText('SAVE TRADE')
        fireEvent.click(saveBtn)

        await waitFor(() => {
            expect(screen.getByText(/Please fill in required fields/i)).toBeInTheDocument()
            expect(mockAddTrade).not.toHaveBeenCalled()
        })
    })

    it.skip('should calculate RR and Save trade', async () => {
        const onClose = vi.fn()
        render(<AddTradeModal isOpen={true} onClose={onClose} />)

        // Fill Form
        fireEvent.change(screen.getByPlaceholderText('EURUSD'), { target: { value: 'GBPUSD' } })
        fireEvent.change(screen.getByLabelText(/Entry/i), { target: { value: '1.2000' } })
        fireEvent.change(screen.getByLabelText(/Stop Loss/i), { target: { value: '1.1980' } }) // 20 pips risk
        fireEvent.change(screen.getByLabelText(/Take Profit/i), { target: { value: '1.2040' } }) // 40 pips reward

        // Use regex to match flexible label (allowing for asset type logic)
        fireEvent.change(screen.getByLabelText(/Realized PnL/i), { target: { value: '40' } })

        // Explicitly select session to ensure validation passes
        fireEvent.click(screen.getByText('New York'))

        // Check RR Calculation (Risk 20, Reward 40 => 2.00)
        await waitFor(() => {
            expect(screen.getByText('2')).toBeInTheDocument()
        })

        // Save
        fireEvent.click(screen.getByText('SAVE TRADE'))

        await waitFor(() => {
            expect(mockAddTrade).toHaveBeenCalled()

            expect(screen.getByText('Trade Vaulted')).toBeInTheDocument()
        })
    })

    it('should close modal on X click', () => {
        const onClose = vi.fn()
        render(<AddTradeModal isOpen={true} onClose={onClose} />)

        const closeBtn = screen.getByRole('button', { name: /close modal/i })
        fireEvent.click(closeBtn)

        expect(onClose).toHaveBeenCalled()
    })
})
