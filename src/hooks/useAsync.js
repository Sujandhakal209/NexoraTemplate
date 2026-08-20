import { useCallback, useEffect, useRef, useState } from 'react'

export function useAsync(factory, dependencies = [], options = {}) {
  const [state, setState] = useState({ data: options.initialData ?? null, loading: true, error: null })
  const requestId = useRef(0)
  const run = useCallback(async () => {
    const current = ++requestId.current
    setState((value) => ({ ...value, loading: true, error: null }))
    try {
      const data = await factory()
      if (current === requestId.current) setState({ data, loading: false, error: null })
    } catch (error) {
      if (current === requestId.current) setState({ data: null, loading: false, error })
    }
  // The caller owns dependency stability just like useEffect.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)
  useEffect(() => { run() }, [run])
  return { ...state, retry: run }
}
