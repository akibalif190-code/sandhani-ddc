import { ImageResponse } from 'next/og'

export const alt = 'Sondhani Lab System'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 64,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'black',
            color: 'white',
            width: 120,
            height: 120,
            borderRadius: 24,
            fontSize: 72,
            fontWeight: 800,
            marginBottom: 24,
          }}
        >
          S
        </div>
        <div style={{ fontWeight: 'bold', letterSpacing: '-0.05em' }}>Sondhani</div>
        <div style={{ fontSize: 32, color: 'gray', marginTop: 12 }}>Lab System</div>
      </div>
    ),
    {
      ...size,
    }
  )
}
