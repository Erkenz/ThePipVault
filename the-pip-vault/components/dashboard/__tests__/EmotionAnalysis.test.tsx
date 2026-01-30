import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import EmotionAnalysis from '../EmotionAnalysis'

const mockUseSettings = vi.fn()
const mockUseProfile = vi.fn()

vi.mock('@/context/SettingsContext', () => ({
    useSettings: () => mockUseSettings()
}))
vi.mock('@/context/ProfileContext', () => ({
    useProfile: () => mockUseProfile()
}))

describe('EmotionAnalysis', () => {
    beforeEach(() => {
        mockUseProfile.mockReturnValue({ profile: { starting_equity: 10000 } })
    })

    it('should render empty state', () => {
        render(<EmotionAnalysis trades={[]} />)
        expect(screen.getByText('No emotion data recorded.')).toBeInTheDocument()
    })

    it('should render emotion stats', () => {
        const mockTrades: any[] = [{
            id: '1',
            emotion: 'Confident',
            pnl: 50,
            pnl_currency: 100
        }]
        render(<EmotionAnalysis trades={mockTrades} />)
        expect(screen.getByText('Confident')).toBeInTheDocument()
        expect(screen.getByText('Flow State')).toBeInTheDocument()
        expect(screen.getByText('+$100.00')).toBeInTheDocument()
    })
})
