import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SettingsPage from '../page'

// --- MOCK MODULES ---
const mockUseProfile = vi.fn()
const mockUseTrades = vi.fn()

vi.mock('@/context/ProfileContext', () => ({
    useProfile: () => mockUseProfile()
}))

vi.mock('@/context/TradeContext', () => ({
    useTrades: () => mockUseTrades()
}))

// Mock ResetVaultModal as it's a child component
vi.mock('@/components/modals/ResetVaultModal', () => ({
    default: ({ isOpen, onResetTrades }: any) => (
        isOpen ? <div data-testid="reset-modal">
            <button onClick={onResetTrades}>Confirm Reset</button>
        </div> : null
    )
}))

describe('Settings Page', () => {
    const updateProfileMock = vi.fn()
    const resetTradesOnlyMock = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()

        mockUseTrades.mockReturnValue({
            trades: [],
            loading: false
        })

        mockUseProfile.mockReturnValue({
            profile: {
                starting_equity: 10000,
                currency: 'USD',
                sessions: ['New York'],
                strategies: ['Breakout']
            },
            updateProfile: updateProfileMock,
            loading: false,
            resetTradesOnly: resetTradesOnlyMock,
            resetSettingsOnly: vi.fn(),
            resetFullAccount: vi.fn()
        })
    })

    it('should render settings form correctly', () => {
        render(<SettingsPage />)
        expect(screen.getByText(/Command Center/i)).toBeInTheDocument()
        expect(screen.getByText(/Account Capital/i)).toBeInTheDocument()

        // Check Equity Input
        const equityInput = screen.getByDisplayValue('10000') // string matched
        expect(equityInput).toBeInTheDocument()

        // Check Strategy
        expect(screen.getByText('Breakout')).toBeInTheDocument()
    })

    it('should allow updating equity', () => {
        render(<SettingsPage />)
        const equityInput = screen.getByDisplayValue('10000')
        fireEvent.change(equityInput, { target: { value: '25000' } })
        expect(screen.getByDisplayValue('25000')).toBeInTheDocument()
    })

    it('should call updateProfile on save', async () => {
        updateProfileMock.mockResolvedValue({})
        render(<SettingsPage />)

        const equityInput = screen.getByDisplayValue('10000')
        fireEvent.change(equityInput, { target: { value: '50000' } })

        const saveButton = screen.getByText(/SAVE CONFIGURATION/i)
        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(updateProfileMock).toHaveBeenCalledWith(expect.objectContaining({
                starting_equity: 50000
            }))
        })
    })

    it('should allow adding a strategy', () => {
        render(<SettingsPage />)

        const input = screen.getByPlaceholderText(/e.g. ICT Silver Bullet/i)
        fireEvent.change(input, { target: { value: 'Scalping' } })

        const addButton = screen.getByText(/ADD STRATEGY/i)
        fireEvent.click(addButton)

        // Validation: Should appear in list
        expect(screen.getByText('Scalping')).toBeInTheDocument()
    })

    it('should open reset modal on request', () => {
        render(<SettingsPage />)

        const resetButton = screen.getByText(/RESET TRADE HISTORY/i)
        fireEvent.click(resetButton)

        expect(screen.getByTestId('reset-modal')).toBeInTheDocument()
    })
})
