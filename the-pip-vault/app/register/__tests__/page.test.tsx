import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RegisterPage from '../page'
// @ts-ignore
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

describe('Register Page', () => {
    const pushMock = vi.fn()
    const signUpMock = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()

        vi.mocked(useRouter).mockReturnValue({
            push: pushMock,
            refresh: vi.fn(),
            replace: vi.fn(),
            back: vi.fn(),
            forward: vi.fn(),
        } as any)

        const mockSupabase = {
            auth: {
                signUp: signUpMock
            },
            from: vi.fn(() => ({
                insert: vi.fn().mockResolvedValue({ error: null })
            }))
        }
        vi.mocked(createClient).mockReturnValue(mockSupabase as any)
    })

    it('should render register form elements', () => {
        render(<RegisterPage />)
        expect(screen.getByPlaceholderText('John')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Doe')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('trader@example.com')).toBeInTheDocument()
        // Check for button existence
        const buttons = screen.getAllByRole('button')
        const submitBtn = buttons.find(b => b.textContent?.includes('CREATE ACCOUNT'))
        expect(submitBtn).toBeInTheDocument()
    })
    it('should show error when passwords do not match', async () => {
        render(<RegisterPage />)

        fireEvent.change(screen.getByPlaceholderText('John'), { target: { value: 'John' } })
        fireEvent.change(screen.getByPlaceholderText('Doe'), { target: { value: 'Doe' } })
        fireEvent.change(screen.getByPlaceholderText('trader@example.com'), { target: { value: 'test@example.com' } })
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } })
        fireEvent.change(screen.getByPlaceholderText('Confirm ••••••••'), { target: { value: 'password456' } }) // Mismatch

        const submitBtn = screen.getByRole('button', { name: /create account/i })
        fireEvent.click(submitBtn)

        // The error might be in a separate container or render slightly delayed.
        // Wait specifically for the text to appear.
        await waitFor(() => {
            // Using queryByText first to debug if needed, but getByText inside waitFor is standard.
            // Ensure no regex issues with "do not match"
            expect(screen.getByText((content) => content.includes("Passwords do not match"))).toBeInTheDocument()
            expect(signUpMock).not.toHaveBeenCalled()
        })
    })

    it('should call signUp on valid submission', async () => {
        signUpMock.mockResolvedValue({ error: null })
        render(<RegisterPage />)

        fireEvent.change(screen.getByPlaceholderText('John'), { target: { value: 'John' } })
        fireEvent.change(screen.getByPlaceholderText('Doe'), { target: { value: 'Doe' } })
        fireEvent.change(screen.getByPlaceholderText('trader@example.com'), { target: { value: 'test@example.com' } })
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } })
        fireEvent.change(screen.getByPlaceholderText('Confirm ••••••••'), { target: { value: 'password123' } })

        const submitBtn = screen.getByRole('button', { name: /create account/i })
        fireEvent.click(submitBtn)

        await waitFor(() => {
            expect(signUpMock).toHaveBeenCalledWith(expect.objectContaining({
                email: 'test@example.com',
                password: 'password123',
                options: expect.objectContaining({
                    emailRedirectTo: expect.stringContaining('/auth/callback')
                })
            }))
        })
    })
})
