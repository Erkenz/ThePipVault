import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import NavBar from '../NavBar'
import * as navigation from 'next/navigation'

// Mock dependencies
vi.mock('next/navigation', () => ({
    usePathname: vi.fn(),
    useRouter: vi.fn(() => ({ push: vi.fn() }))
}))



// Mock Sub-Components to isolate NavBar logic
vi.mock('../modals/AddTradeModal', () => ({
    default: ({ isOpen, onClose }: any) => isOpen ? (
        <div data-testid="add-trade-modal">
            <button onClick={onClose}>Close Modal</button>
        </div>
    ) : null
}))

vi.mock('./UserMenu', () => ({
    default: () => <div data-testid="user-menu">User Menu</div>
}))

describe('NavBar', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should render navigation items on dashboard', () => {
        // Setup return value for this specific test
        vi.mocked(navigation.usePathname).mockReturnValue('/')

        render(<NavBar />)

        // Check Logo/Title
        expect(screen.getByText(/The PipVault/i)).toBeInTheDocument()

        // Check Links
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
        expect(screen.getByText('Journal')).toBeInTheDocument()

        // Check Actions
        expect(screen.getByText(/New Trade/i)).toBeInTheDocument()
        expect(screen.getByTestId('user-menu')).toBeInTheDocument()
    })

    it('should NOT render on login page', () => {
        vi.mocked(navigation.usePathname).mockReturnValue('/login')
        const { container } = render(<NavBar />)
        expect(container).toBeEmptyDOMElement()
    })

    it('should highlight active journal link', () => {
        vi.mocked(navigation.usePathname).mockReturnValue('/journal')
        render(<NavBar />)

        const journalLink = screen.getByRole('link', { name: /Journal/i })
        expect(journalLink).toHaveClass('text-pip-gold')

        const dashboardLink = screen.getByRole('link', { name: /Dashboard/i })
        expect(dashboardLink).not.toHaveClass('text-pip-gold')
    })

    it('should open AddTradeModal when button is clicked', () => {
        vi.mocked(navigation.usePathname).mockReturnValue('/')
        render(<NavBar />)

        const newTradeBtn = screen.getByRole('button', { name: /New Trade/i })
        fireEvent.click(newTradeBtn)

        expect(screen.getByTestId('add-trade-modal')).toBeInTheDocument()
    })
})
