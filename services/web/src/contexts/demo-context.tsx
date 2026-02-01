'use client'

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import {
  demoGalleries,
  demoClients,
  demoSessions,
  demoPayments,
  demoMetrics,
  demoChartData,
  demoUser,
  sessionTypes,
  availableTimeSlots,
  type DemoGallery,
  type DemoClient,
  type DemoSession,
  type DemoPayment,
  type DemoMetrics,
  type DemoPhoto,
} from '@/lib/demo-data'

interface BookingFormData {
  clientName: string
  clientEmail: string
  clientPhone: string
  sessionType: string
  date: string
  time: string
  location: string
  notes: string
}

interface DemoContextType {
  // State
  isDemo: boolean
  user: typeof demoUser
  galleries: DemoGallery[]
  clients: DemoClient[]
  sessions: DemoSession[]
  payments: DemoPayment[]
  metrics: DemoMetrics
  chartData: typeof demoChartData
  sessionTypes: typeof sessionTypes
  availableTimeSlots: typeof availableTimeSlots

  // Gallery actions
  getGallery: (id: string) => DemoGallery | undefined
  togglePhotoSelection: (galleryId: string, photoId: string) => void
  togglePhotoFavorite: (galleryId: string, photoId: string) => void
  getSelectedPhotos: (galleryId: string) => DemoPhoto[]

  // Client actions
  getClient: (id: string) => DemoClient | undefined

  // Session actions
  getSession: (id: string) => DemoSession | undefined
  getUpcomingSessions: () => DemoSession[]
  getRecentSessions: () => DemoSession[]

  // Booking actions
  submitBookingInquiry: (data: BookingFormData) => Promise<{ success: boolean; sessionId: string }>

  // UI state
  activeGalleryId: string | null
  setActiveGalleryId: (id: string | null) => void
  showBookingSuccess: boolean
  setShowBookingSuccess: (show: boolean) => void
}

const DemoContext = createContext<DemoContextType | undefined>(undefined)

export function DemoProvider({ children }: { readonly children: React.ReactNode }) {
  const [galleries, setGalleries] = useState<DemoGallery[]>(demoGalleries)
  const [sessions, setSessions] = useState<DemoSession[]>(demoSessions)
  const [activeGalleryId, setActiveGalleryId] = useState<string | null>(null)
  const [showBookingSuccess, setShowBookingSuccess] = useState(false)

  const getGallery = useCallback((id: string) => {
    return galleries.find(g => g.id === id)
  }, [galleries])

  const togglePhotoSelection = useCallback((galleryId: string, photoId: string) => {
    setGalleries(prev => prev.map(gallery => {
      if (gallery.id !== galleryId) return gallery
      return {
        ...gallery,
        photos: gallery.photos.map(photo => {
          if (photo.id !== photoId) return photo
          return { ...photo, selected: !photo.selected }
        })
      }
    }))
  }, [])

  const togglePhotoFavorite = useCallback((galleryId: string, photoId: string) => {
    setGalleries(prev => prev.map(gallery => {
      if (gallery.id !== galleryId) return gallery
      return {
        ...gallery,
        photos: gallery.photos.map(photo => {
          if (photo.id !== photoId) return photo
          return { ...photo, favorited: !photo.favorited }
        })
      }
    }))
  }, [])

  const getSelectedPhotos = useCallback((galleryId: string) => {
    const gallery = galleries.find(g => g.id === galleryId)
    return gallery?.photos.filter(p => p.selected) ?? []
  }, [galleries])

  const getClient = useCallback((id: string) => {
    return demoClients.find(c => c.id === id)
  }, [])

  const getSession = useCallback((id: string) => {
    return sessions.find(s => s.id === id)
  }, [sessions])

  const getUpcomingSessions = useCallback(() => {
    const today = new Date()
    return sessions
      .filter(s => new Date(s.date) >= today && s.status !== 'cancelled' && s.status !== 'completed')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [sessions])

  const getRecentSessions = useCallback(() => {
    return sessions
      .filter(s => s.status === 'completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  }, [sessions])

  const submitBookingInquiry = useCallback(async (data: BookingFormData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    const sessionType = sessionTypes.find(t => t.id === data.sessionType)
    const newSession: DemoSession = {
      id: `session-${Date.now()}`,
      clientId: `client-new-${Date.now()}`,
      clientName: data.clientName,
      sessionType: sessionType?.name ?? data.sessionType,
      date: data.date,
      time: data.time,
      duration: sessionType?.duration ?? 60,
      location: data.location,
      status: 'inquiry',
      totalAmount: sessionType?.basePrice ?? 500,
      depositAmount: Math.round((sessionType?.basePrice ?? 500) * 0.3),
      depositPaid: false,
      balancePaid: false,
      contractSigned: false,
    }

    setSessions(prev => [...prev, newSession])
    setShowBookingSuccess(true)

    return { success: true, sessionId: newSession.id }
  }, [])

  const value = useMemo(() => ({
    isDemo: true,
    user: demoUser,
    galleries,
    clients: demoClients,
    sessions,
    payments: demoPayments,
    metrics: demoMetrics,
    chartData: demoChartData,
    sessionTypes,
    availableTimeSlots,
    getGallery,
    togglePhotoSelection,
    togglePhotoFavorite,
    getSelectedPhotos,
    getClient,
    getSession,
    getUpcomingSessions,
    getRecentSessions,
    submitBookingInquiry,
    activeGalleryId,
    setActiveGalleryId,
    showBookingSuccess,
    setShowBookingSuccess,
  }), [
    galleries,
    sessions,
    getGallery,
    togglePhotoSelection,
    togglePhotoFavorite,
    getSelectedPhotos,
    getClient,
    getSession,
    getUpcomingSessions,
    getRecentSessions,
    submitBookingInquiry,
    activeGalleryId,
    showBookingSuccess,
  ])

  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  )
}

export function useDemo() {
  const context = useContext(DemoContext)
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider')
  }
  return context
}
