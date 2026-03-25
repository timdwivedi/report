import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
          borderRadius: '40px',
        }}
      >
        <svg width="110" height="110" viewBox="0 0 22 22" fill="none">
          <rect x="2" y="2" width="12" height="12" rx="3" fill="white" fillOpacity="0.9" />
          <rect x="8" y="8" width="12" height="12" rx="3" fill="white" fillOpacity="0.6" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
