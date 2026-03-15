import React, { createContext, useContext, useEffect } from 'react'
import { useMediaQuery, BREAKPOINTS } from '../hooks/useMediaQuery'

const ViewportContext = createContext({
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  isTabletOrMobile: false,
})

export function useViewport() {
  return useContext(ViewportContext)
}

export function ViewportProvider({ children }) {
  const isMobile = useMediaQuery(BREAKPOINTS.mobile)
  const isTablet = useMediaQuery(BREAKPOINTS.tablet)
  const isDesktop = useMediaQuery(BREAKPOINTS.desktop)
  const isTabletOrMobile = useMediaQuery(BREAKPOINTS.maxTablet)

  useEffect(() => {
    document.body.classList.toggle('viewport-mobile', isMobile)
    document.body.classList.toggle('viewport-tablet', isTablet)
    document.body.classList.toggle('viewport-desktop', isDesktop)
    document.body.classList.toggle('viewport-tablet-or-mobile', isTabletOrMobile)
  }, [isMobile, isTablet, isDesktop, isTabletOrMobile])

  const value = {
    isMobile,
    isTablet,
    isDesktop,
    isTabletOrMobile,
  }

  return (
    <ViewportContext.Provider value={value}>
      {children}
    </ViewportContext.Provider>
  )
}
