import { useEffect, useState } from 'react'

export default function useBarcodeScanner(onScanComplete) {
  const [buffer, setBuffer] = useState('')

  useEffect(() => {
    let timer

    const handleKeyDown = (e) => {
      clearTimeout(timer)
      if (e.key === 'Enter') {
        if (buffer.length > 0) {
          onScanComplete(buffer.trim())
          setBuffer('')
        }
      } else {
        setBuffer((prev) => prev + e.key)
        timer = setTimeout(() => setBuffer(''), 100)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [buffer, onScanComplete])
}
