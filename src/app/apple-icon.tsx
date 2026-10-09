import { markImage } from '@/lib/og'

/* What iOS saves to the home screen; app/icon.svg covers everything else. */
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return markImage(180)
}
