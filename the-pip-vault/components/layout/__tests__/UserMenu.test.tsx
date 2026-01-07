import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import UserMenu from '../UserMenu'
import { signOut } from '@/app/login/actions'

// Mock dependencies
vi.mock('@/app/login/actions', () => ({
    signOut: vi.fn()
}))

describe('UserMenu', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should render collapsed by default', () => {
        render(<UserMenu />)
        expect(screen.queryByText('Account Info')).not.toBeInTheDocument()
    })

    it('should open menu on click', () => {
        render(<UserMenu />)
        // Find trigger button (User icon parent)
        const trigger = screen.getByRole('button')
        fireEvent.click(trigger)

        expect(screen.getByText('Account Info')).toBeInTheDocument()
        expect(screen.getByText('Settings')).toBeInTheDocument()
        expect(screen.getByText('Logout')).toBeInTheDocument()
    })

    it('should call signOut on logout click', () => {
        render(<UserMenu />)
        fireEvent.click(screen.getByRole('button'))

        fireEvent.click(screen.getByText('Logout'))
        expect(signOut).toHaveBeenCalled()
    })

    it('should close when clicking outside', () => {
        render(
            <div>
                <div data-testid="outside">Outside</div>
                <UserMenu />
            </div>
        )

        // Open it
        fireEvent.click(screen.queryAllByRole('button')[0])
        expect(screen.getByText('Account Info')).toBeInTheDocument()

        // Click outside
        fireEvent.mouseDown(screen.getByTestId('outside'))
        expect(screen.queryByText('Account Info')).not.toBeInTheDocument()
    })
})
