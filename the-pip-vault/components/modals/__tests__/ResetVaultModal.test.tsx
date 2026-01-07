import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ResetVaultModal from '../ResetVaultModal'

describe('ResetVaultModal', () => {
    const onResetTrades = vi.fn()
    const onResetSettings = vi.fn()
    const onResetAll = vi.fn()
    const onClose = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should not render when isOpen is false', () => {
        render(<ResetVaultModal isOpen={false} onClose={onClose} onResetTrades={onResetTrades} onResetSettings={onResetSettings} onResetAll={onResetAll} />)
        expect(screen.queryByText('Danger Zone: Reset Vault')).not.toBeInTheDocument()
    })

    it('should render all options when open', () => {
        render(<ResetVaultModal isOpen={true} onClose={onClose} onResetTrades={onResetTrades} onResetSettings={onResetSettings} onResetAll={onResetAll} />)
        expect(screen.getByText('Reset Trade History')).toBeInTheDocument()
        expect(screen.getByText('Reset Settings')).toBeInTheDocument()
        expect(screen.getByText('Full Account Reset')).toBeInTheDocument()
    })

    it('should call onResetTrades when clicked', async () => {
        onResetTrades.mockResolvedValue(undefined)
        render(<ResetVaultModal isOpen={true} onClose={onClose} onResetTrades={onResetTrades} onResetSettings={onResetSettings} onResetAll={onResetAll} />)

        const btn = screen.getByText('Reset Trade History')
        fireEvent.click(btn)

        await waitFor(() => {
            expect(onResetTrades).toHaveBeenCalled()
            expect(onClose).toHaveBeenCalled()
        })
    })

    it('should call onResetSettings when clicked', async () => {
        onResetSettings.mockResolvedValue(undefined)
        render(<ResetVaultModal isOpen={true} onClose={onClose} onResetTrades={onResetTrades} onResetSettings={onResetSettings} onResetAll={onResetAll} />)

        const btn = screen.getByText('Reset Settings')
        fireEvent.click(btn)

        await waitFor(() => {
            expect(onResetSettings).toHaveBeenCalled()
            expect(onClose).toHaveBeenCalled()
        })
    })

    it('should call onResetAll when clicked', async () => {
        onResetAll.mockResolvedValue(undefined)
        render(<ResetVaultModal isOpen={true} onClose={onClose} onResetTrades={onResetTrades} onResetSettings={onResetSettings} onResetAll={onResetAll} />)

        const btn = screen.getByText('Full Account Reset')
        fireEvent.click(btn)

        await waitFor(() => {
            expect(onResetAll).toHaveBeenCalled()
            expect(onClose).toHaveBeenCalled()
        })
    })
})
