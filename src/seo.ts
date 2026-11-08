import type { Product } from './types'

const siteUrl = 'https://steinplatte.site'
const defaultImage = `${siteUrl}/social-preview.jpg`

interface PageSeo {
  title: string
  description: string
  path?: string
  noIndex?: boolean
}

const collectionSeo: Record<string, PageSeo> = {
  alle: {
    title: 'Alle Produkte | STEINPLATTE',
    description: 'Entdecken Sie alle Mineralien, Edelsteine, Schmuckstücke und alpinen Produkte von STEINPLATTE.',
  },
  mineralien: {
    title: 'Mineralien & Kristalle | STEINPLATTE',
    description: 'Entdecken Sie ausgewählte Mineralien und Kristalle in natürlichen Formen und besonderen Farben.',
  },
  edelsteine: {
    title: 'Edelsteine entdecken | STEINPLATTE',
    description: 'Entdecken Sie Edelsteine mit charakteristischen Farben, Strukturen und natürlichen Einschlüssen.',
  },
  schmuck: {
    title: 'Schmuck mit Edelsteinen | STEINPLATTE',
    description: 'Entdecken Sie ausgewählte Schmuckstücke mit Edelsteinen und natürlichen Mineralien.',
  },
  'wohnen-geschenke': {
    title: 'Wohnen & Geschenke | STEINPLATTE',
    description: 'Mineralien und ausgewählte Stücke aus Naturstein für Wohnräume und als Geschenk.',
  },
  'ski-outdoor': {
    title: 'Ski & Outdoor | STEINPLATTE',
    description: 'Entdecken Sie ausgewählte Artikel für Aktivitäten und Ausflüge in den Bergen.',
  },
}

const adminSections: Record<string, string> = {
  übersicht: 'Übersicht',
  produkte: 'Produkte',
  kategorien: 'Kategorien',
  lagerbestand: 'Lagerbestand',
  wareneingang: 'Wareneingang',
  bestellungen: 'Bestellungen',
  kunden: 'Kunden',
  medien: 'Medien',
  'website-inhalte': 'Website-Inhalte',
  einstellungen: 'Einstellungen',
  benutzer: 'Benutzer',
}

const privatePage = (title: string): PageSeo => ({
  title,
  description: 'STEINPLATTE',
  noIndex: true,
})

function decodePath(pathname: string) {
  try {
    return decodeURIComponent(pathname)
  } catch {
    return pathname
  }
}

export function resolvePageSeo(pathname: string, products: Product[]): PageSeo {
  const path = decodePath(pathname).replace(/\/+$/, '') || '/'

  if (path === '/') {
    return {
      title: 'STEINPLATTE | Mineralien, Edelsteine & Schmuck',
      description: 'Entdecken Sie bei STEINPLATTE ausgewählte Mineralien, Edelsteine und Schmuckstücke mit Charakter.',
      path: '/',
    }
  }

  if (path.startsWith('/shop/')) {
    const slug = path.slice('/shop/'.length)
    const seo = collectionSeo[slug] ?? collectionSeo.alle
    const canonicalSlug = collectionSeo[slug] ? slug : 'alle'
    return { ...seo, path: `/shop/${canonicalSlug}` }
  }

  if (path.startsWith('/produkt/')) {
    const productId = path.slice('/produkt/'.length)
    const product = products.find((item) => item.id === productId)
    if (!product || !product.published || product.archived) {
      return privatePage('Produkt nicht gefunden | STEINPLATTE')
    }
    return {
      title: `${product.name} | STEINPLATTE`,
      description: product.description.replace(/\s+/g, ' ').trim().slice(0, 160),
      path: `/produkt/${encodeURIComponent(product.id)}`,
    }
  }

  if (path === '/ueber-uns') {
    return {
      title: 'Über uns | STEINPLATTE',
      description: 'Lernen Sie STEINPLATTE und unsere Begeisterung für Mineralien, Edelsteine und alpine Natur kennen.',
      path,
    }
  }

  if (path === '/kontakt') {
    return {
      title: 'Kontakt | STEINPLATTE',
      description: 'Kontaktieren Sie STEINPLATTE bei Fragen zu Mineralien, Edelsteinen und unserem Sortiment.',
      path,
    }
  }

  if (path === '/warenkorb') return privatePage('Warenkorb | STEINPLATTE')
  if (path === '/verwaltung/anmelden') return privatePage('Anmeldung zur Verwaltung | STEINPLATTE')
  if (path === '/verwaltung') return privatePage('Übersicht · Verwaltung | STEINPLATTE')

  if (path.startsWith('/verwaltung/')) {
    const section = path.slice('/verwaltung/'.length).toLocaleLowerCase('de-AT')
    const label = adminSections[section] ?? `${section} · Verwaltung`
    return privatePage(`${label} | STEINPLATTE`)
  }

  return privatePage('Seite nicht gefunden | STEINPLATTE')
}

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.append(element)
  }
  element.content = content
}

function setCanonical(path?: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!path) {
    element?.remove()
    return
  }
  if (!element) {
    element = document.createElement('link')
    element.rel = 'canonical'
    document.head.append(element)
  }
  element.href = `${siteUrl}${path}`
}

export function applyPageSeo(pathname: string, products: Product[]) {
  const seo = resolvePageSeo(pathname, products)
  document.title = seo.title
  document.documentElement.lang = 'de-AT'
  setCanonical(seo.path)

  if (seo.noIndex) setMeta('name', 'robots', 'noindex, nofollow')
  else document.head.querySelector('meta[name="robots"]')?.remove()

  setMeta('name', 'description', seo.description)
  setMeta('property', 'og:title', seo.title)
  setMeta('property', 'og:description', seo.description)
  setMeta('property', 'og:url', seo.path ? `${siteUrl}${seo.path}` : siteUrl)
  setMeta('property', 'og:image', defaultImage)
  setMeta('name', 'twitter:title', seo.title)
  setMeta('name', 'twitter:description', seo.description)
  setMeta('name', 'twitter:image', defaultImage)
}
