import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'

export const useApi = (path, query = null, deps = []) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(Boolean(path))
  const [error, setError] = useState(null)
  const requestId = useRef(0)
  const queryKey = JSON.stringify(query || {})

  const load = useCallback(
    async ({ quiet = false } = {}) => {
      if (!path) return null
      const current = ++requestId.current
      if (!quiet) setLoading(true)
      setError(null)
      try {
        const result = await api.get(path, query)
        if (current === requestId.current) setData(result)
        return result
      } catch (requestError) {
        if (current === requestId.current) setError(requestError)
        return null
      } finally {
        if (current === requestId.current) setLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [path, queryKey, ...deps],
  )

  useEffect(() => {
    load()
    return () => {
      requestId.current += 1
    }
  }, [load])

  return { data, setData, loading, error, refetch: load }
}
