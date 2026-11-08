import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, Check, Minus, Plus, ZoomIn } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { Breadcrumbs, euro, ProductCard, Storefront, categorySlug } from '../components/Storefront'
import { Carousel } from '../components/Carousel'
import { orderedProductImages } from '../productImages'

export function ProductPage() {
  const { productId } = useParams({ from: '/produkt/$productId' })
  const { products, addToCart } = useStore()
  const product = products.find((item) => item.id === productId)
  const [quantity, setQuantity] = useState(1)
  const [zoomOpen, setZoomOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  useEffect(() => {
    setSelectedImageIndex(0)
    setQuantity(1)
  }, [product?.id, product?.image])
  if (!product) {
    return <Storefront><div className="not-found section-wrap"><span className="eyebrow">DIESES FUNDSTÜCK GIBT ES NICHT</span><h1>Nichts gefunden.</h1><Link className="text-link" to="/shop/$category" params={{ category: 'alle' }}><ArrowLeft size={16} /> Zur Kollektion</Link></div></Storefront>
  }
  const related = products.filter((item) => item.category === product.category && item.id !== product.id && item.published && !item.archived).slice(0, 4)
  const available = product.quantity > 0 && product.published && !product.archived
  const savedImages = orderedProductImages(product)
  const imageList = savedImages.length ? savedImages : [product.image]
  const activeImage = imageList[Math.min(selectedImageIndex, imageList.length - 1)] ?? product.image
  const imageFollows = activeImage === '/images/bild-folgt.svg'

  return (
    <Storefront>
      <div className="section-wrap product-detail-wrap">
        <Breadcrumbs items={[{ label: product.category, to: '/shop/$category', category: categorySlug[product.category] }, { label: product.name }]} />
        <div className="product-detail">
          <div className="product-gallery">
            <Carousel
              className="carousel-gallery"
              label={`Bilder von ${product.name}`}
              activeIndex={Math.min(selectedImageIndex, imageList.length - 1)}
              onActiveIndexChange={setSelectedImageIndex}
              showIndicators={false}
            >
              {imageList.map((image, index) => (
                <button key={`${image}-${index}`} className="gallery-main" onClick={() => setZoomOpen(true)} aria-label={image === '/images/bild-folgt.svg' ? 'Produktbild folgt' : `Produktbild ${index + 1} vergrößern`} disabled={image === '/images/bild-folgt.svg'}>
                  <img src={image} alt={image === '/images/bild-folgt.svg' ? 'Bild folgt' : `${product.name}, Ansicht ${index + 1}`} loading={index === 0 ? 'eager' : 'lazy'} />
                  {image !== '/images/bild-folgt.svg' && <span className="zoom-hint"><ZoomIn size={17} /> Vergrößern</span>}
                </button>
              ))}
            </Carousel>
            {product.imageIsIllustrative && <p className="illustrative-caption">Beispielabbildung. Das verfügbare Stück kann abweichen.</p>}
            {imageList.length > 1 && <div className="gallery-thumbs">
              {imageList.map((image, index) => <button key={`${image}-${index}`} className={`gallery-thumb ${selectedImageIndex === index ? 'gallery-thumb-active' : ''}`} onClick={() => setSelectedImageIndex(index)} aria-label={`Ansicht ${index + 1} anzeigen`} aria-pressed={selectedImageIndex === index}><img src={image} alt="" loading="lazy" /></button>)}
            </div>}
          </div>
          <div className="product-detail-copy">
            <span className="eyebrow">{product.category.toLocaleUpperCase('de-AT')} · {product.sku}</span>
            <h1>{product.name}</h1>
            <p className="detail-price">{euro(product.price)}</p>
            <p className="detail-description">{product.description}</p>
            <div className={`availability ${available ? 'available' : 'unavailable'}`}><span />{available ? 'Sofort verfügbar' : product.availability}</div>
            <div className="detail-actions">
              <div className="quantity-picker">
                <button aria-label="Menge verringern" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={15} /></button>
                <span>{quantity}</span>
                <button aria-label="Menge erhöhen" disabled={quantity >= product.quantity} onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}><Plus size={15} /></button>
              </div>
              <button className="button button-dark add-to-cart" disabled={!available} onClick={() => {
                for (let index = 0; index < quantity; index += 1) addToCart(product.id)
              }}>{available ? 'In den Warenkorb' : 'Derzeit nicht verfügbar'} <ArrowRight size={17} /></button>
            </div>
            <p className="demo-caption"><Check size={14} /> Demo-Shop. Keine echte Bestellung oder Zahlung.</p>
            <div className="product-facts">
              {product.mineral && <div><span>Mineralart</span><strong>{product.mineral}</strong></div>}
              {product.weight && <div><span>Gewicht</span><strong>{product.weight}</strong></div>}
              {product.dimensions && <div><span>Maße</span><strong>{product.dimensions}</strong></div>}
              {product.color && <div><span>Farbe</span><strong>{product.color}</strong></div>}
              <div><span>Verfügbarkeit</span><strong>{available ? 'Auf Lager' : product.availability}</strong></div>
            </div>
            {product.tags.length > 0 && <div className="tag-row">{product.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}
          </div>
        </div>
      </div>
      {related.length > 0 && <section className="related-section section-wrap"><div className="section-heading"><div><span className="eyebrow">PASST DAZU</span><h2>Ähnliche <em>Fundstücke.</em></h2></div></div><div className="product-grid">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div></section>}
      {zoomOpen && <div className="image-lightbox" role="dialog" aria-modal="true" aria-label="Produktbild in Großansicht" onClick={() => setZoomOpen(false)}><button className="lightbox-close" onClick={() => setZoomOpen(false)} aria-label="Schließen">×</button><img src={activeImage} alt={imageFollows ? 'Bild folgt' : product.name} onClick={(event) => event.stopPropagation()} /></div>}
    </Storefront>
  )
}
