"use client"

import { useState, useEffect, useCallback, useRef } from 'react'

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  staleWhileRevalidate?: boolean
}

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const cache = new Map<string, CacheEntry<any>>()

export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
) {
  const { ttl = 5 * 60 * 1000, staleWhileRevalidate = true } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const fetchingRef = useRef(false)

  const isStale = useCallback((entry: CacheEntry<T> | undefined) => {
    if (!entry) return true
    return Date.now() - entry.timestamp > ttl
  }, [ttl])

  const fetchData = useCallback(async (skipCache = false) => {
    // Prevent duplicate fetches
    if (fetchingRef.current) return
    fetchingRef.current = true

    try {
      const cachedEntry = cache.get(key)

      // Return cached data if fresh
      if (!skipCache && cachedEntry && !isStale(cachedEntry)) {
        setData(cachedEntry.data)
        setLoading(false)
        fetchingRef.current = false
        return
      }

      // If stale-while-revalidate, show stale data immediately
      if (staleWhileRevalidate && cachedEntry) {
        setData(cachedEntry.data)
        setLoading(false)
      }

      // Fetch fresh data
      const freshData = await fetcher()

      // Update cache
      cache.set(key, {
        data: freshData,
        timestamp: Date.now(),
      })

      setData(freshData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch'))
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [key, fetcher, isStale, staleWhileRevalidate])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = useCallback(() => {
    setLoading(true)
    return fetchData(true)
  }, [fetchData])

  const invalidate = useCallback(() => {
    cache.delete(key)
  }, [key])

  return {
    data,
    loading,
    error,
    refetch,
    invalidate,
  }
}

// Utility to invalidate cache entries by prefix
export function invalidateCacheByPrefix(prefix: string) {
  const keys = Array.from(cache.keys())
  for (const key of keys) {
    if (key.startsWith(prefix)) {
      cache.delete(key)
    }
  }
}

// Clear entire cache
export function clearCache() {
  cache.clear()
}
