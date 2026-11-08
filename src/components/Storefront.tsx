import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowRight, Instagram, Menu, Search, ShoppingBag, X } from 'lucide-react'
import { useRef, useState, type FormEvent, type PropsWithChildren } from 'react'
import { categories } from '../data'
import { euro } from '../currency'
import { orderedProductImages } from '../productImages'
import { useStore } from '../store'
import type { Category, Product } from '../types'
import { ProductQuickView } from './ProductQuickView'

export const categorySlug: Record<Category, string> = {
  Mineralien: 'mineralien',
  Edelsteine: 'edelsteine',
  Schmuck: 'schmuck',
  'Wohnen & Geschenke': 'wohnen-geschenke',
  'Ski & Outdoor': 'ski-outdoor',
}

export { euro }

export function Storefront({ children }: PropsWithChildren) {
  return (
    <div className="storefront">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  )
}

function Header() {
  const { cart, search, setSearch } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const searchInput = useRef<HTMLInputElement>(null)
  const cartCount = cart.reduce((total, line) => total + line.quantity, 0)

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMenuOpen(false)
    void navigate({ to: '/shop/$category', params: { category: 'alle' } })
  }

  return (
    <>
      <header className="site-header">
        <button className="icon-button mobile-menu-toggle" aria-label={menuOpen ? 'Menü schließen' : 'Menü öffnen'} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <Link className="wordmark" to="/" aria-label="STEINPLATTE, Startseite">
          <span>STEINPLATTE</span>
          <small>Mineralien &amp; Edelsteine</small>
        </Link>
        <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Hauptnavigation">
          {categories.map((category) => (
            <Link
              key={category}
              to="/shop/$category"
              params={{ category: categorySlug[category] }}
              onClick={() => setMenuOpen(false)}
              className="nav-link"
            >
              {category}
            </Link>
          ))}
          <Link className="mobile-extra-link" to="/ueber-uns" onClick={() => setMenuOpen(false)}>Über uns</Link>
          <Link className="mobile-extra-link" to="/kontakt" onClick={() => setMenuOpen(false)}>Kontakt</Link>
        </nav>
        <div className="header-actions">
          <form className="search-form" role="search" onSubmit={submitSearch}>
            <button type="button" className="search-trigger" aria-label="Suche öffnen" onClick={() => searchInput.current?.focus()}><Search size={16} aria-hidden="true" /></button>
            <input ref={searchInput} aria-label="Produkte suchen" placeholder="Suche" value={search} onChange={(event) => setSearch(event.target.value)} />
          </form>
          <Link className="cart-link" to="/warenkorb" aria-label={`Warenkorb, ${cartCount} Artikel`}>
            <ShoppingBag size={19} /><span className="cart-label">Warenkorb</span><span className="cart-count">{cartCount}</span>
          </Link>
        </div>
      </header>
    </>
  )
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link className="wordmark footer-wordmark" to="/"><span>STEINPLATTE</span><small>Mineralien &amp; Edelsteine</small></Link>
          <p>Ausgewählte Mineralien, Edelsteine und Schmuckstücke.</p>
        </div>
        <div className="footer-column">
          <h3>Entdecken</h3>
          <Link to="/shop/$category" params={{ category: 'mineralien' }}>Mineralien</Link>
          <Link to="/shop/$category" params={{ category: 'schmuck' }}>Schmuck</Link>
          <Link to="/ueber-uns">Über uns</Link>
        </div>
        <div className="footer-column">
          <h3>Wir sind für Sie da</h3>
          <Link to="/kontakt">Kontakt</Link>
          <span>Antworten auf Fragen zu unseren Produkten.</span>
        </div>
        <div className="footer-note">
          <p>Mineralien und Edelsteine für Sammlerinnen, Sammler und Ihr Zuhause.</p>
          <a className="social-link" href="https://www.instagram.com/" target="_blank" rel="noreferrer"><Instagram size={16} /> Instagram</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} STEINPLATTE</span>
        <a href="https://steinplatte.site">steinplatte.site</a>
        <span>Demo-Shop. Abbildungen, Preise und Bestände sind beispielhaft. · <a href="/image-credits.txt">Bildnachweise</a></span>
        <span className="footer-credit">Entwicklung: Rodrigo Alves · <a href="https://rrv.digital" target="_blank" rel="noreferrer">rrv.digital</a></span>
      </div>
    </footer>
  )
}

export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { addToCart } = useStore()
  const [quickViewOpen, setQuickViewOpen] = useState(false)
  const imageButtonRef = useRef<HTMLButtonElement>(null)
  const productImages = orderedProductImages(product)
  const imageFollows = productImages.length === 0
  const cardImage = imageFollows ? product.image : product.image === '/images/bild-folgt.svg' ? productImages[0] : product.image
  const available = product.quantity > 0 && product.published && !product.archived
  return (
    <article className={`product-card ${compact ? 'product-card-compact' : ''}`}>
      {imageFollows ? (
        <Link to="/produkt/$productId" params={{ productId: product.id }} className="product-card-image product-card-image-pending">
          <img src={cardImage} alt="Produktfoto folgt" loading="lazy" />
          {!available && <span className="product-badge badge-muted">Derzeit nicht verfügbar</span>}
        </Link>
      ) : (
        <button
          ref={imageButtonRef}
          type="button"
          className="product-card-image product-card-image-quick-view"
          onClick={() => setQuickViewOpen(true)}
          aria-label={`${product.name} in der Schnellansicht öffnen`}
        >
          <img src={cardImage} alt={product.name} loading="lazy" />
          {!product.imageIsIllustrative && product.uniquePiece && <span className="product-badge">Unikat</span>}
          {!available && <span className="product-badge badge-muted">Derzeit nicht verfügbar</span>}
          <span className="image-arrow" aria-hidden="true"><ArrowRight size={17} /></span>
        </button>
      )}
      <div className="product-card-copy">
        <span className="product-category">{product.category}</span>
        <Link to="/produkt/$productId" params={{ productId: product.id }} className="product-title">{product.name}</Link>
        <div className="product-card-bottom">
          <span className="product-price">{euro(product.price)}</span>
          <button
            className="small-add-button"
            aria-label={`${product.name} in den Warenkorb legen`}
            disabled={!available}
            onClick={() => addToCart(product.id)}
          >
            <ShoppingBag size={16} />
          </button>
        </div>
      </div>
      {quickViewOpen && (
        <ProductQuickView
          product={product}
          onClose={() => setQuickViewOpen(false)}
          returnFocusRef={imageButtonRef}
        />
      )}
    </article>
  )
}

export function Breadcrumbs({ items }: { items: { label: string; to?: '/' | '/shop/$category'; category?: string }[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Brotkrumennavigation">
      <Link to="/">Startseite</Link>
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="breadcrumb-item">
          <span aria-hidden="true">/</span>
          {item.to === '/shop/$category' && item.category
            ? <Link to={item.to} params={{ category: item.category }}>{item.label}</Link>
            : item.to === '/'
              ? <Link to="/">{item.label}</Link>
              : <span aria-current="page">{item.label}</span>}
        </span>
      ))}
    </nav>
  )
}
