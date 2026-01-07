import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
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
        const submitBtn = buttons.find(b => b.textContent?.includes('REGISTER'))
        expect(submitBtn).toBeInTheDocument()
    })
})
