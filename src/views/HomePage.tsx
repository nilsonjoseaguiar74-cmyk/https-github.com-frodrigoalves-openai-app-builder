import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { categories, categoryImages } from '../data'
import { useStore } from '../store'
import { ProductCard, Storefront, categorySlug } from '../components/Storefront'
import { Carousel } from '../components/Carousel'
import { readSiteContent } from '../siteContent'

export function HomePage() {
  const { products } = useStore()
  const content = readSiteContent()
  const featured = products
    .filter((product) => product.published && !product.archived)
    .sort((a, b) => Number(a.image === '/images/bild-folgt.svg') - Number(b.image === '/images/bild-folgt.svg'))

  return (
    <Storefront>
      <section className="hero">
        <div className="hero-content">
          <h1>{content.heroTitle}</h1>
          <p>{content.heroDescription}</p>
          <Link className="button button-dark" to="/shop/$category" params={{ category: 'mineralien' }}>{content.heroCallToAction} <ArrowRight size={17} /></Link>
        </div>
        <div className="hero-image-wrap">
          <img className="hero-image" src="/images/smoky-quartz.webp" alt="Rauchquarz-Kristall" />
        </div>
      </section>

      <section className="intro-section section-wrap">
        <div className="intro-copy">
          <p className="display-copy">{content.introTitle}</p>
          <p>{content.introDescription}</p>
          <Link className="text-link" to="/ueber-uns">Über uns <ArrowRight size={16} /></Link>
        </div>
        <div className="intro-image-wrap">
          <img src="/images/fluorite-specimen.jpg" alt="Fluoritkristall mit natürlichen Einschlüssen" loading="lazy" />
        </div>
      </section>

      <section className="category-section" id="kollektionen">
        <div className="section-wrap">
          <div className="section-heading">
            <div><h2>Kollektionen</h2></div>
          </div>
          <Carousel className="carousel-categories" label="Kollektionen">
            {categories.map((category, index) => (
              <Link key={category} className={`category-tile category-tile-${index + 1}`} to="/shop/$category" params={{ category: categorySlug[category] }}>
                <img src={categoryImages[category]} alt="" loading="lazy" />
                <span className="category-tile-overlay" />
                <span className="category-tile-copy"><span>{category}</span><ArrowRight size={18} /></span>
              </Link>
            ))}
          </Carousel>
        </div>
      </section>

      <section className="featured-section section-wrap">
        <div className="section-heading">
          <div><h2>Ausgewählte Produkte</h2></div>
          <Link className="text-link" to="/shop/$category" params={{ category: 'alle' }}>Alle Produkte <ArrowRight size={16} /></Link>
        </div>
        <Carousel className="carousel-products" label="Ausgewählte Produkte">
          {featured.map((product) => <ProductCard key={product.id} product={product} />)}
        </Carousel>
      </section>

    </Storefront>
  )
}
