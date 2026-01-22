import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { TradeProvider, useTrades } from '../TradeContext'
import { ReactNode } from 'react'
// @ts-ignore
import { createClient } from '@/utils/supabase/client'

// Mock is already global in setup, but we need to control the instance
// We can also just control the return value of the globally mocked createClient

const wrapper = ({ children }: { children: ReactNode }) => (
    <TradeProvider>{children}</TradeProvider>
)

describe('TradeContext', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        const mockSupabase = {
            auth: {
                getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-uid' } }, error: null }),
                onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
            },
            from: vi.fn(() => ({
                select: vi.fn().mockReturnThis(),
                order: vi.fn().mockReturnValue({ data: [], error: null }),
                insert: vi.fn().mockReturnThis(),
                delete: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis()
            }))
        }

        vi.mocked(createClient).mockReturnValue(mockSupabase as any)
    })

    it('should initialize with empty trades and loading true', async () => {
        const { result } = renderHook(() => useTrades(), { wrapper })
        // Initial state
        expect(result.current.loading).toBe(true)
        expect(result.current.trades).toEqual([])

        // Wait for loading to finish (mocked auth resolves)
        await waitFor(() => expect(result.current.loading).toBe(false))
    })

    // Additional tests for addTrade / deleteTrade would go here
    // But we need to ensure the mocks return data for them to work.
})
