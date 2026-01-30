import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '../page'
// @ts-ignore
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

// Mocks
// vitest.setup.ts already mocks createClient and useRouter globally.
// We just need to mock what they return for specific tests.

describe('Login Page', () => {
    const pushMock = vi.fn()
    const signInMock = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()

        // Setup Router Mock
        vi.mocked(useRouter).mockReturnValue({
            push: pushMock,
            refresh: vi.fn(),
            replace: vi.fn(),
            back: vi.fn(),
            forward: vi.fn(),
        } as any)

        // Setup Supabase Mock
        const mockSupabase = {
            auth: {
                signInWithPassword: signInMock
            }
        }
        vi.mocked(createClient).mockReturnValue(mockSupabase as any)
    })

    it('should render login form', () => {
        render(<LoginPage />)
        // Check for reference elements
        expect(screen.getByPlaceholderText('trader@example.com')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
        // Check for AUTHENTICATE text in button
        expect(screen.getByRole('button', { name: /AUTHENTICATE/i })).toBeInTheDocument()
    })

    it('should handle login submission', async () => {
        signInMock.mockResolvedValue({ error: null })
        render(<LoginPage />)

        // Fill form
        fireEvent.change(screen.getByPlaceholderText('trader@example.com'), { target: { value: 'test@test.com' } })
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password' } })

        // Submit
        const button = screen.getByRole('button', { name: /AUTHENTICATE/i })
        fireEvent.click(button)

        await waitFor(() => {
            expect(signInMock).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password' })
            expect(pushMock).toHaveBeenCalledWith('/')
        })
    })

    it('should display error on failure', async () => {
        signInMock.mockResolvedValue({ error: { message: 'Invalid login' } })
        render(<LoginPage />)

        // Fill form
        fireEvent.change(screen.getByPlaceholderText('trader@example.com'), { target: { value: 'test@test.com' } })
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrongpassword' } })

        // Submit
        fireEvent.click(screen.getByRole('button', { name: /AUTHENTICATE/i }))

        await waitFor(() => {
            expect(screen.getByText('Invalid credentials.')).toBeInTheDocument()
        })
    })
})
