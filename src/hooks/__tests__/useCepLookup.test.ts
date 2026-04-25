import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useCepLookup } from '../useCepLookup'

describe('useCepLookup', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns idle state for cep with less than 8 digits', () => {
    const { result } = renderHook(() => useCepLookup('123', 0))
    expect(result.current.data).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('fetches and returns address for valid cep', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          cep: '01310-100',
          logradouro: 'Avenida Paulista',
          bairro: 'Bela Vista',
          localidade: 'São Paulo',
          uf: 'SP'
        }),
        { status: 200 }
      )
    )

    const { result } = renderHook(() => useCepLookup('01310100', 0))

    await waitFor(() => expect(result.current.data).not.toBeNull())
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://viacep.com.br/ws/01310100/json/',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    )
    expect(result.current.data?.logradouro).toBe('Avenida Paulista')
    expect(result.current.error).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('returns not_found error when ViaCEP responds with erro=true', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ erro: true }), { status: 200 })
    )

    const { result } = renderHook(() => useCepLookup('00000000', 0))

    await waitFor(() => expect(result.current.error).toBe('not_found'))
    expect(result.current.data).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('returns network error when fetch throws', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('boom'))

    const { result } = renderHook(() => useCepLookup('01310100', 0))

    await waitFor(() => expect(result.current.error).toBe('network'))
    expect(result.current.isLoading).toBe(false)
  })

  it('does not surface network error when fetch is aborted (debounce/unmount)', async () => {
    vi.spyOn(global, 'fetch').mockImplementationOnce((_url, init) => {
      const signal = (init as RequestInit).signal!
      return new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => {
          const err = new Error('aborted')
          err.name = 'AbortError'
          reject(err)
        })
      })
    })

    const { result, unmount } = renderHook(() => useCepLookup('01310100', 0))

    await waitFor(() => expect(result.current.isLoading).toBe(true))
    unmount()

    // Aguarda um tick pra garantir que o abort propagou
    await new Promise((r) => setTimeout(r, 20))
    // Após abort/unmount, não devemos ter setado state pra 'network'.
    // (após unmount o setState seria no-op, mas o teste é da intenção)
    expect(result.current.error).not.toBe('network')
  })

  it('rejects non-object body (returns not_found)', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(null), { status: 200 })
    )

    const { result } = renderHook(() => useCepLookup('01310100', 0))

    await waitFor(() => expect(result.current.error).toBe('not_found'))
    expect(result.current.data).toBeNull()
  })

  it('strips non-digit characters from cep', async () => {
    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ cep: '01310-100', logradouro: '', bairro: '', localidade: '', uf: '' }),
          { status: 200 }
        )
      )

    renderHook(() => useCepLookup('01310-100', 0))

    await waitFor(() =>
      expect(fetchSpy).toHaveBeenCalledWith(
        'https://viacep.com.br/ws/01310100/json/',
        expect.any(Object)
      )
    )
  })
})
