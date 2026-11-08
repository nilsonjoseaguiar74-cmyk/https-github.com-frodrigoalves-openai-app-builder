import type { Product } from './types'

const placeholderImage = '/images/bild-folgt.svg'

export function orderedProductImages(product: Pick<Product, 'image' | 'images'>): string[] {
  const images = [...new Set(product.images ?? [])]
    .filter((image) => image !== placeholderImage)

  if (product.image !== placeholderImage && !images.includes(product.image)) {
    images.push(product.image)
  }

  if (images.length === 0 && product.image !== placeholderImage) {
    return [product.image]
  }

  return images
}
