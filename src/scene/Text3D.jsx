import { useLayoutEffect, useRef } from 'react'
import { Text } from 'troika-three-text'
import { extend } from '@react-three/fiber'
import unboundedBlack from '@fontsource/unbounded/files/unbounded-latin-900-normal.woff?url'
import unboundedBold from '@fontsource/unbounded/files/unbounded-latin-700-normal.woff?url'
import grotesk from '@fontsource/space-grotesk/files/space-grotesk-latin-400-normal.woff?url'

extend({ TroikaText: Text })

export const FONTS = { display: unboundedBlack, displayBold: unboundedBold, body: grotesk }

// Thin wrapper over troika-three-text: display for headlines, body for prose.
export default function Text3D({
  children,
  variant = 'body',
  size = 0.3,
  color = '#f4f2f0',
  opacity = 1,
  maxWidth = 8,
  align = 'center',
  anchorX = 'center',
  anchorY = 'middle',
  letterSpacing = 0,
  lineHeight = 1.4,
  ...props
}) {
  const ref = useRef()
  useLayoutEffect(() => { ref.current?.sync() })
  return (
    <troikaText
      ref={ref}
      text={children}
      font={variant === 'body' ? FONTS.body : variant === 'bold' ? FONTS.displayBold : FONTS.display}
      fontSize={size}
      color={color}
      maxWidth={maxWidth}
      textAlign={align}
      anchorX={anchorX}
      anchorY={anchorY}
      letterSpacing={letterSpacing}
      lineHeight={lineHeight}
      material-transparent
      material-opacity={opacity}
      material-fog={true}
      {...props}
    />
  )
}
