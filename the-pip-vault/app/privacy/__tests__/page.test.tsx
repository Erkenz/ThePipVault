import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PrivacyPage from '../page'

describe('PrivacyPage', () => {
    it('should render privacy policy content', () => {
        render(<PrivacyPage />)
        expect(screen.getByRole('heading', { name: /Privacy Policy/i })).toBeInTheDocument()
        expect(screen.getByText(/Last updated/i)).toBeInTheDocument()
        expect(screen.getByText(/We respect your privacy/i)).toBeInTheDocument()
    })
})
