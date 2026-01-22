import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AccountForm from '../account-form'

// Mocks
const mockUpdateUser = vi.fn()
const mockSignOut = vi.fn()
const mockUpdateProfile = vi.fn()
const mockResetFullAccount = vi.fn()
const mockPush = vi.fn()

vi.mock('@/utils/supabase/client', () => ({
    createClient: () => ({
        auth: {
            updateUser: mockUpdateUser,
            signOut: mockSignOut
        },
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn()
        }))
    })
}))

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush })
}))

vi.mock('@/context/ProfileContext', () => ({
    useProfile: () => ({
        updateProfile: mockUpdateProfile,
        resetFullAccount: mockResetFullAccount
    })
}))

describe('AccountForm', () => {
    const mockUser = { email: 'test@example.com' }
    const mockProfile = { first_name: 'John', last_name: 'Doe' }

    beforeEach(() => {
        vi.clearAllMocks()
        mockUpdateUser.mockResolvedValue({ error: null })
        mockSignOut.mockResolvedValue({ error: null })
        mockUpdateProfile.mockResolvedValue(null)
        mockResetFullAccount.mockResolvedValue(null)
    })

    it('should render profile inputs', () => {
        render(<AccountForm user={mockUser} profile={mockProfile} />)
        expect(screen.getByDisplayValue('John')).toBeInTheDocument()
        expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument()
    })

    it('should call updateProfile on save', async () => {
        render(<AccountForm user={mockUser} profile={mockProfile} />)

        const firstNameInput = screen.getByDisplayValue('John')
        fireEvent.change(firstNameInput, { target: { value: 'Jane' } })

        const saveButton = screen.getByRole('button', { name: /Save Details/i })
        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(mockUpdateProfile).toHaveBeenCalledWith(expect.objectContaining({
                first_name: 'Jane'
            }))
        })
    })

    it('should call delete account flow', async () => {
        render(<AccountForm user={mockUser} profile={mockProfile} />)

        // 1. Click initial delete button (in danger zone)
        // Using strict role to avoid confusion with modal header text
        const deleteTrigger = screen.getByRole('button', { name: /Delete Account/i })
        fireEvent.click(deleteTrigger)

        // 2. Expect modal to appear
        expect(screen.getByRole('heading', { name: /Delete Account\?/i })).toBeInTheDocument()

        // 3. Click confirm in modal
        const confirmButton = screen.getByRole('button', { name: /Yes, Delete Everything/i })
        fireEvent.click(confirmButton)

        await waitFor(() => {
            expect(mockResetFullAccount).toHaveBeenCalled()
            expect(mockSignOut).toHaveBeenCalled()
            expect(mockPush).toHaveBeenCalledWith('/login')
        })
    })
})
