import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { TradeProvider, useTrades } from '../TradeContext'
import { ReactNode } from 'react'
// @ts-ignore
import { createClient } from '@/utils/supabase/client'

// Mock Supabase client
const selectMock = vi.fn()
const insertMock = vi.fn()
const updateMock = vi.fn()
const deleteMock = vi.fn()
const orderMock = vi.fn()
const eqMock = vi.fn()
const singleMock = vi.fn()

const mockSupabase = {
    auth: {
        getUser: vi.fn(),
        onAuthStateChange: vi.fn((...args: any[]) => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
    },
    from: vi.fn(() => ({
        select: selectMock,
        insert: insertMock,
        update: updateMock,
        delete: deleteMock,
    }))
}

// Chain setup
selectMock.mockReturnValue({ eq: eqMock, order: orderMock })
eqMock.mockReturnValue({ order: orderMock, select: selectMock }) // handle .eq chain
orderMock.mockReturnValue({ data: [], error: null })
insertMock.mockReturnValue({ select: selectMock })
updateMock.mockReturnValue({ eq: eqMock, select: selectMock }) // update chain often involves eq
deleteMock.mockReturnValue({ eq: eqMock })

beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createClient).mockReturnValue(mockSupabase as any)

    // Default auth mock
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'test-uid' } }, error: null })
})

const wrapper = ({ children }: { children: ReactNode }) => (
    <TradeProvider>{children}</TradeProvider>
)

describe('TradeContext', () => {

    it('should initialize and fetch trades on mount', async () => {
        const mockTrades = [{ id: '1', pair: 'EURUSD', entry_price: 1.1 }]
        orderMock.mockResolvedValue({ data: mockTrades, error: null })

        const { result } = renderHook(() => useTrades(), { wrapper })

        expect(result.current.loading).toBe(true)
        await waitFor(() => expect(result.current.loading).toBe(false))

        expect(result.current.trades).toHaveLength(1)
        expect(result.current.trades[0].pair).toBe('EURUSD')
    })

    it('should handle fetch errors gracefully', async () => {
        // Mock error response
        orderMock.mockRejectedValue(new Error('Fetch failed'))
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

        const { result } = renderHook(() => useTrades(), { wrapper })

        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.trades).toEqual([])

        consoleSpy.mockRestore()
    })

    it('should add a trade successfully', async () => {
        // Setup initial empty state
        orderMock.mockResolvedValue({ data: [], error: null })
        const { result } = renderHook(() => useTrades(), { wrapper })
        await waitFor(() => expect(result.current.loading).toBe(false))

        // Mock insert return
        const newTradeRaw = { id: 'new-1', pair: 'GBPUSD', entry_price: 1.25, user_id: 'test-uid' }
        // The implementation calls .insert().select() -> data check
        // So allow the chain: insert -> select -> resolved value
        const selectReturnMock = vi.fn().mockResolvedValue({ data: [newTradeRaw], error: null })
        insertMock.mockReturnValue({ select: selectReturnMock })

        await act(async () => {
            await result.current.addTrade({
                pair: 'GBPUSD',
                entryPrice: 1.25,
                direction: 'LONG',
                date: '2023-01-01',
                stopLoss: 1.20,
                // @ts-ignore partial for test
            })
        })

        await waitFor(() => {
            expect(result.current.trades).toHaveLength(1)
            expect(result.current.trades[0].id).toBe('new-1')
        })
    })

    it('should update a trade successfully', async () => {
        // Initial state with one trade
        const initialTrade = { id: '1', pair: 'EURUSD', entry_price: 1.0, user_id: 'test-uid' }
        orderMock.mockResolvedValue({ data: [initialTrade], error: null })

        const { result } = renderHook(() => useTrades(), { wrapper })
        await waitFor(() => expect(result.current.loading).toBe(false))

        // Mock update return
        const updatedTradeRaw = { ...initialTrade, pair: 'EURUSD', entry_price: 1.1 }
        // Implementation: .update().eq().select()
        const selectReturnMock = vi.fn().mockResolvedValue({ data: [updatedTradeRaw], error: null })
        const eqReturnMock = vi.fn().mockReturnValue({ select: selectReturnMock })
        updateMock.mockReturnValue({ eq: eqReturnMock })

        await act(async () => {
            await result.current.updateTrade('1', { entryPrice: 1.1 })
        })

        await waitFor(() => {
            expect(result.current.trades[0].entryPrice).toBe(1.1)
        })
    })

    it('should delete a trade successfully', async () => {
        // Initial state
        const initialTrade = { id: 'delete-me', pair: 'USDJPY', entry_price: 100, user_id: 'test-uid' }
        orderMock.mockResolvedValue({ data: [initialTrade], error: null })

        const { result } = renderHook(() => useTrades(), { wrapper })
        await waitFor(() => expect(result.current.loading).toBe(false))

        // Mock delete return
        const eqReturnMock = vi.fn().mockResolvedValue({ error: null })
        deleteMock.mockReturnValue({ eq: eqReturnMock })

        // Prevent re-fetch from restoring the trade
        orderMock.mockResolvedValue({ data: [], error: null })

        await act(async () => {
            await result.current.deleteTrade('delete-me')
        })

        expect(deleteMock).toHaveBeenCalled()
        expect(eqReturnMock).toHaveBeenCalledWith('id', 'delete-me')

        await waitFor(() => {
            expect(result.current.trades).toHaveLength(0)
        })
    })

    it('should clear trades on sign out', async () => {
        const { result } = renderHook(() => useTrades(), { wrapper })

        // Find the callback passed to onAuthStateChange and trigger it
        const authCallback = mockSupabase.auth.onAuthStateChange.mock.calls[0]?.[0]

        if (typeof authCallback === 'function') {
            await act(async () => {
                authCallback('SIGNED_OUT', null)
            })
        }

        expect(result.current.trades).toEqual([])
    })
})
