import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingCard } from '../Loadingcard'

describe('LoadingCard', () => {
    it('should render loading state correctly', () => {
        render(<LoadingCard title="Test Data" />)

        // Use a more specific query or add a testid if role generic is flaky
        // Since we can't easily add testid to the component without editing it, 
        // let's look for the text which is robust.
        expect(screen.getByText(/Loading Test Data/i)).toBeInTheDocument()

        // To check for the animate-pulse class, we can find the parent container
        // The parent has "Loading Test Data..." text.
        const textElement = screen.getByText(/Loading Test Data/i)
        const container = textElement.closest('div')
        expect(container).toHaveClass('animate-pulse')
    })

    it('should render default text', () => {
        render(<LoadingCard />)
        expect(screen.getByText(/Loading Data.../i)).toBeInTheDocument()
    })
})
