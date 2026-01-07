import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { ProfileProvider, useProfile } from '../ProfileContext'
import { ReactNode } from 'react'
// @ts-ignore
import { createClient } from '@/utils/supabase/client'

const wrapper = ({ children }: { children: ReactNode }) => (
    <ProfileProvider>{children}</ProfileProvider>
)

describe('ProfileContext', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        const mockSupabase = {
            auth: {
                getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-uid' } }, error: null }),
                onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
            },
            from: vi.fn(() => ({
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: { starting_equity: 10000 }, error: null }),
                upsert: vi.fn().mockResolvedValue({ error: null }),
                eq: vi.fn().mockReturnThis()
            }))
        }

        vi.mocked(createClient).mockReturnValue(mockSupabase as any)
    })

    it('should initialize with default profile and loading state', async () => {
        const { result } = renderHook(() => useProfile(), { wrapper })

        // Initial state
        expect(result.current.loading).toBe(true)
        // Check default values before fetch completes
        expect(result.current.profile.starting_equity).toBe(10000)

        // Wait for fetch
        await waitFor(() => expect(result.current.loading).toBe(false))
    })
})
