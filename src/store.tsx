import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { demoProducts } from './data'
import type { CartLine, Product, StockMovement } from './types'

interface StoreValue {
  products: Product[]
  cart: CartLine[]
  movements: StockMovement[]
  search: string
  setSearch: (value: string) => void
  saveProduct: (product: Product) => void
  addToCart: (productId: string) => void
  setCartQuantity: (productId: string, quantity: number) => void
  removeFromCart: (productId: string) => void
  adjustStock: (productId: string, quantity: number, kind: StockMovement['kind']) => void
}

const StoreContext = createContext<StoreValue | null>(null)

function readStorage<T>(key: string, fallback: T): T {
  const saved = window.localStorage.getItem(key)
  if (!saved) return fallback
  try {
    return JSON.parse(saved) as T
  } catch (error) {
    console.error(`Die gespeicherten Demo-Daten "${key}" konnten nicht gelesen werden.`, error)
    return fallback
  }
}

function writeStorage<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Die Demo-Daten "${key}" konnten nicht lokal gespeichert werden.`, error)
  }
}

const demoImageByProduct: Record<string, string> = {
  'rauchquarz-spitze': '/images/smoky-quartz-editorial.webp',
  'amethyst-druse': '/images/amethyst-geode-editorial.webp',
  'bergkristall-anhänger': '/images/bild-folgt.svg',
  'turmalin-armband': '/images/bild-folgt.svg',
  'fluorit-objekt': '/images/bild-folgt.svg',
  'stein-schale': '/images/onyx-bowl-editorial.webp',
  'edelweiss-anstecker': '/images/bild-folgt.svg',
  'achat-trommelstein': '/images/bild-folgt.svg',
}

const legacyImageReferences: Record<string, string[]> = {
  'rauchquarz-spitze': [
    '/images/smoky-quartz.png',
    '/images/smoky-quartz.webp',
    'photo-1600210492486-724fe5c67fb0',
  ],
  'amethyst-druse': ['/images/amethyst-geode.webp', '/images/amethyst-flower.jpg', 'pomegranate', 'granatapfel'],
  'bergkristall-anhänger': ['/images/rock-crystal-pendant.webp', 'photo-1611652022419-a9419f74343d'],
  'turmalin-armband': ['/images/tourmaline-bracelet.webp', 'photo-1617038220319-276d3cfab638'],
  'fluorit-objekt': ['/images/fluorite-specimen.jpg'],
  'stein-schale': ['/images/onyx-bowl.jpg', 'photo-1600210492486-724fe5c67fb0'],
  'edelweiss-anstecker': ['photo-1551524164-687a55dd1126'],
  'achat-trommelstein': ['photo-1615485925600-97237c4fc1ec'],
}

function isLegacyImage(product: Product, image: string): boolean {
  const knownLegacyImage = (legacyImageReferences[product.id] ?? [])
    .some((reference) => image.toLocaleLowerCase('en').includes(reference))
  if (knownLegacyImage) return true

  const affectedDemoProduct = product.id === 'rauchquarz-spitze' || product.id === 'amethyst-druse'
  // Old demo stock photos were remote Unsplash URLs; admin uploads are stored as data URLs.
  return affectedDemoProduct
    && /^https?:\/\/images\.unsplash\.com\//i.test(image)
}

function migrateLegacyDemoProduct(product: Product): Product {
  const demoImage = demoImageByProduct[product.id]
  if (!demoImage) return product

  const storedImages = product.images ?? []
  const images = storedImages.filter((image) =>
    !isLegacyImage(product, image)
    && !(image === '/images/bild-folgt.svg' && demoImage !== '/images/bild-folgt.svg'),
  )
  const primaryNeedsMigration = isLegacyImage(product, product.image)
    || (
      product.image === '/images/bild-folgt.svg'
      && product.imageIsIllustrative !== false
      && demoImage !== '/images/bild-folgt.svg'
    )
  const image = primaryNeedsMigration ? demoImage : product.image
  const imageIsIllustrative = image === demoImage
    ? demoImage !== '/images/bild-folgt.svg'
    : image !== product.image
      ? false
      : product.imageIsIllustrative

  if (
    image === product.image
    && imageIsIllustrative === product.imageIsIllustrative
    && images.length === storedImages.length
  ) return product

  return {
    ...product,
    image,
    images: images.length ? images : undefined,
    imageIsIllustrative,
  }
}

export function StoreProvider({ children }: PropsWithChildren) {
  const [products, setProducts] = useState<Product[]>(() => readStorage('mader-products', demoProducts).map(migrateLegacyDemoProduct))
  const [cart, setCart] = useState<CartLine[]>(() => readStorage('mader-cart', []))
  const [movements, setMovements] = useState<StockMovement[]>(() => readStorage('mader-stock-movements', []))
  const [search, setSearch] = useState('')

  useEffect(() => writeStorage('mader-products', products), [products])
  useEffect(() => writeStorage('mader-cart', cart), [cart])
  useEffect(() => writeStorage('mader-stock-movements', movements), [movements])

  const saveProduct = useCallback((product: Product) => {
    const exists = products.some((item) => item.id === product.id)
    const nextProducts = exists
      ? products.map((item) => item.id === product.id ? product : item)
      : [product, ...products]
    const serialized = JSON.stringify(nextProducts)
    if (serialized.length > 2_000_000) {
      throw new Error('Der lokale Demo-Speicher ist voll. Bitte weniger oder kleinere Produktbilder verwenden.')
    }
    try {
      window.localStorage.setItem('mader-products', serialized)
    } catch (error) {
      console.error('Die Produkte konnten nicht lokal gespeichert werden.', error)
      throw new Error('Speichern fehlgeschlagen. Bitte prüfen Sie den verfügbaren Browser-Speicher.')
    }
    setProducts(nextProducts)
  }, [products])

  const addToCart = useCallback((productId: string) => {
    const product = products.find((item) => item.id === productId)
    if (!product || product.quantity < 1 || !product.published || product.archived) return
    setCart((lines) => {
      const line = lines.find((item) => item.productId === productId)
      if (line) {
        return lines.map((item) => item.productId === productId
          ? { ...item, quantity: Math.min(item.quantity + 1, product.quantity) }
          : item)
      }
      return [...lines, { productId, quantity: 1 }]
    })
  }, [products])

  const setCartQuantity = useCallback((productId: string, quantity: number) => {
    const stock = products.find((item) => item.id === productId)?.quantity ?? 0
    setCart((current) => quantity <= 0
      ? current.filter((item) => item.productId !== productId)
      : current.map((item) => item.productId === productId
        ? { ...item, quantity: Math.min(quantity, stock) }
        : item))
  }, [products])

  const removeFromCart = useCallback((productId: string) => {
    setCart((current) => current.filter((item) => item.productId !== productId))
  }, [])

  const adjustStock = useCallback((productId: string, quantity: number, kind: StockMovement['kind']) => {
    if (quantity === 0) return
    const product = products.find((item) => item.id === productId)
    if (!product) return
    const nextQuantity = Math.max(0, product.quantity + quantity)
    setProducts((current) => current.map((item) => {
      if (item.id !== productId) return item
      return {
        ...item,
        quantity: nextQuantity,
        availability: nextQuantity > 0 ? 'Auf Lager' : 'Nicht verfügbar',
      }
    }))
    setCart((current) => current.flatMap((line) => {
      if (line.productId !== productId) return [line]
      return nextQuantity > 0 ? [{ ...line, quantity: Math.min(line.quantity, nextQuantity) }] : []
    }))
    setMovements((current) => [{
      id: `${Date.now()}-${productId}`,
      productName: product.name,
      quantity,
      kind,
      date: new Intl.DateTimeFormat('de-AT', { dateStyle: 'medium' }).format(new Date()),
    }, ...current])
  }, [products])

  const value = useMemo(() => ({
    products, cart, movements, search, setSearch, saveProduct, addToCart, setCartQuantity, removeFromCart, adjustStock,
  }), [products, cart, movements, search, saveProduct, addToCart, setCartQuantity, removeFromCart, adjustStock])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const value = useContext(StoreContext)
  if (!value) throw new Error('useStore muss innerhalb des StoreProvider verwendet werden.')
  return value
}
