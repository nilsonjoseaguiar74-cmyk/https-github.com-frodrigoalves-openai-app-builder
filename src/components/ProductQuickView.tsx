import { Link } from '@tanstack/react-router'
import { ArrowRight, ShoppingBag, X } from 'lucide-react'
import { useEffect, useRef, useState, type KeyboardEvent, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { euro } from '../currency'
import { orderedProductImages } from '../productImages'
import { useStore } from '../store'
import type { Product } from '../types'

interface ProductQuickViewProps {
  product: Product
  onClose: () => void
  returnFocusRef: RefObject<HTMLElement | null>
}

export function ProductQuickView({ product, onClose, returnFocusRef }: ProductQuickViewProps) {
  const { addToCart } = useStore()
  const dialogRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const images = orderedProductImages(product)
  const initialImageIndex = Math.max(0, images.indexOf(product.image))
  const [selectedImageIndex, setSelectedImageIndex] = useState(initialImageIndex)
  const activeImage = images[selectedImageIndex] ?? product.image
  const available = product.quantity > 0 && product.published && !product.archived

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    closeButtonRef.current?.focus()
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
      if (returnFocusRef.current?.isConnected) returnFocusRef.current.focus()
    }
  }, [returnFocusRef])

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }

    if (event.key !== 'Tab') return
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
    )
    if (!focusable?.length) {
      event.preventDefault()
      dialogRef.current?.focus()
      return
    }

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return createPortal(
    <div
      className="quick-view-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        ref={dialogRef}
        className="product-quick-view"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-view-title"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        <button ref={closeButtonRef} className="quick-view-close" type="button" onClick={onClose} aria-label="Ansicht schließen">
          <X size={20} />
        </button>
        <div className="quick-view-layout">
          <div className="quick-view-gallery">
            <div className="quick-view-image">
              <img src={activeImage} alt={`${product.name}, Ansicht ${selectedImageIndex + 1}`} />
            </div>
            {images.length > 1 && (
              <div className="quick-view-thumbnails" aria-label="Produktbilder">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    className={`quick-view-thumbnail ${selectedImageIndex === index ? 'is-selected' : ''}`}
                    onClick={() => setSelectedImageIndex(index)}
                    aria-label={`Foto ${index + 1} anzeigen`}
                    aria-pressed={selectedImageIndex === index}
                  >
                    <img src={image} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="quick-view-copy">
            <span className="product-category">{product.category}</span>
            <h2 id="quick-view-title">{product.name}</h2>
            {product.description.trim() && <p className="quick-view-description">{product.description}</p>}
            <p className="quick-view-price">{euro(product.price)}</p>
            <p className={`quick-view-availability ${available ? 'is-available' : ''}`}>
              <span aria-hidden="true" />
              {product.availability}
            </p>
            {product.imageIsIllustrative && (
              <p className="quick-view-caption">Beispielabbildung. Das verfügbare Stück kann abweichen.</p>
            )}
            <div className="quick-view-actions">
              <Link className="button button-outline" to="/produkt/$productId" params={{ productId: product.id }}>
                Zum Produkt <ArrowRight size={16} />
              </Link>
              <button
                className="button button-dark"
                type="button"
                disabled={!available}
                onClick={() => addToCart(product.id)}
              >
                <ShoppingBag size={16} />
                In den Warenkorb
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  )
}
