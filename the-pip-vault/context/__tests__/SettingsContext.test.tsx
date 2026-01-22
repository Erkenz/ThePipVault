import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { SettingsProvider, useSettings } from '../SettingsContext'
import { ReactNode } from 'react'
import React from 'react'

const wrapper = ({ children }: { children: ReactNode }) => (
  <SettingsProvider>{children}</SettingsProvider>
)

describe('SettingsContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should default to pips view', () => {
    const { result } = renderHook(() => useSettings(), { wrapper })
    expect(result.current.viewMode).toBe('pips')
  })

  it('should toggle view modes correctly: pips -> currency -> percentage -> pips', () => {
    const { result } = renderHook(() => useSettings(), { wrapper })

    // Initial: pips
    expect(result.current.viewMode).toBe('pips')

    // Toggle 1: Currency
    act(() => {
      result.current.toggleViewMode()
    })
    expect(result.current.viewMode).toBe('currency')

    // Toggle 2: Percentage
    act(() => {
      result.current.toggleViewMode()
    })
    expect(result.current.viewMode).toBe('percentage')

    // Toggle 3: Back to Pips
    act(() => {
      result.current.toggleViewMode()
    })
    expect(result.current.viewMode).toBe('pips')
  })

  it('should set view mode manually', () => {
    const { result } = renderHook(() => useSettings(), { wrapper })

    act(() => {
      result.current.setViewMode('percentage')
    })

    expect(result.current.viewMode).toBe('percentage')
    expect(localStorage.getItem('pip-vault-view-mode')).toBe('percentage')
  })

  it('should load from local storage', () => {
    localStorage.setItem('pip-vault-view-mode', 'currency')
    const { result } = renderHook(() => useSettings(), { wrapper })
    expect(result.current.viewMode).toBe('currency')
  })
})
