import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import EquityChart from '../EquityChart'

// Mock Hooks
const mockUseSettings = vi.fn()
const mockUseProfile = vi.fn()

vi.mock('@/context/SettingsContext', () => ({
    useSettings: () => mockUseSettings()
}))

vi.mock('@/context/ProfileContext', () => ({
    useProfile: () => mockUseProfile()
}))

// Mock Recharts Components globally for this file
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
    AreaChart: ({ children }: any) => <div data-testid="area-chart"></div>,
    Area: () => <div data-testid="area" />,
    XAxis: () => <div data-testid="xaxis" />,
    YAxis: () => <div data-testid="yaxis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
}))

describe('EquityChart', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        mockUseSettings.mockReturnValue({
            viewMode: 'currency',
            toggleViewMode: vi.fn(),
            setViewMode: vi.fn()
        })

        mockUseProfile.mockReturnValue({
            profile: { starting_equity: 10000 },
            updateProfile: vi.fn(),
            loading: false,
        })
    })

    it('should render chart container', () => {
        render(<EquityChart trades={[]} />)
        expect(screen.getByText('Not enough data yet')).toBeInTheDocument()
    })

    it('should calculate and display current equity correctly (Currency)', () => {
        const mockTrades: any[] = [{
            id: '1',
            date: new Date().toISOString(),
            pair: 'EURUSD',
            pnl: 50,
            pnl_currency: 100 // 10000 + 100 = 10100
        }]

        render(<EquityChart trades={mockTrades} />)

        expect(screen.getByText('Current: $10100.00')).toBeInTheDocument()
    })

    it('should calculate and display percentage correctly', () => {
        const mockTrades: any[] = [{
            id: '1',
            date: new Date().toISOString(),
            pair: 'EURUSD',
            pnl_currency: 100 // 1% of 10000
        }]

        mockUseSettings.mockReturnValue({
            viewMode: 'percentage',
            toggleViewMode: vi.fn(),
            setViewMode: vi.fn()
        })

        render(<EquityChart trades={mockTrades} />)
        expect(screen.getByText('Current: 1.00%')).toBeInTheDocument()
    })
})
