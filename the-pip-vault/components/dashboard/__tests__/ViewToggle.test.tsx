import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ViewToggle from '../ViewToggle'

const mockUseSettings = vi.fn()

vi.mock('@/context/SettingsContext', () => ({
    useSettings: () => mockUseSettings()
}))

describe('ViewToggle', () => {
    const setViewModeMock = vi.fn()

    beforeEach(() => {
        mockUseSettings.mockReturnValue({
            viewMode: 'pips',
            setViewMode: setViewModeMock
        })
    })

    it('should render all options', () => {
        render(<ViewToggle />)
        expect(screen.getByTitle('Pips/Points')).toBeInTheDocument()
        expect(screen.getByTitle('PnL ($)')).toBeInTheDocument()
        expect(screen.getByTitle('Percentage')).toBeInTheDocument()
    })

    it('should call setViewMode on click', () => {
        render(<ViewToggle />)
        fireEvent.click(screen.getByTitle('PnL ($)'))
        expect(setViewModeMock).toHaveBeenCalledWith('currency')
    })
})
