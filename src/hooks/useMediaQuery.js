import { useState, useEffect } from 'react'

/**
 * Match a CSS media query. Updates when the match changes (e.g. resize).
 * @param {string} query - e.g. '(max-width: 768px)' or '(min-width: 769px)'
 * @returns {boolean} true when the media query matches
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = (e) => setMatches(e.matches)
    setMatches(mql.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}

/** Common breakpoints (CSS query strings) for the project */
export const BREAKPOINTS = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)',
  maxTablet: '(max-width: 1024px)',
}

/**
 * Convenience hook for mobile view (max-width: 767px).
 * Use across the project for conditional mobile layout/rendering.
 */
export function useIsMobile() {
  return useMediaQuery(BREAKPOINTS.mobile)
}

/**
 * Tablet or smaller (max-width: 1024px).
 */
export function useIsTabletOrMobile() {
  return useMediaQuery(BREAKPOINTS.maxTablet)
}
