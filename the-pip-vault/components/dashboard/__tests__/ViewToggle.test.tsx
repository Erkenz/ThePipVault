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
        expect(screen.getByText('PIPS')).toBeInTheDocument()
        expect(screen.getByText('PNL')).toBeInTheDocument()
        expect(screen.getByText('%')).toBeInTheDocument()
    })

    it('should call setViewMode on click', () => {
        render(<ViewToggle />)
        fireEvent.click(screen.getByText('PNL'))
        expect(setViewModeMock).toHaveBeenCalledWith('currency')
    })
})
