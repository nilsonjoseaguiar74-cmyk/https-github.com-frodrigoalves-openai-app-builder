export interface SiteContent {
  heroTitle: string
  heroDescription: string
  heroCallToAction: string
  introTitle: string
  introDescription: string
}

export const defaultSiteContent: SiteContent = {
  heroTitle: 'Mineralien mit Charakter.',
  heroDescription: 'Entdecken Sie ausgewählte Mineralien, Edelsteine und Schmuckstücke.',
  heroCallToAction: 'Kollektion entdecken',
  introTitle: 'Mineralien und Edelsteine für besondere Sammlungen und Räume.',
  introDescription: 'Entdecken Sie natürliche Formen, klare Farben und ausgewählte Schmuckstücke.',
}

const storageKey = 'steinplatte-site-content'

export function readSiteContent(): SiteContent {
  const saved = window.localStorage.getItem(storageKey)
  if (!saved) return defaultSiteContent

  try {
    const parsed: unknown = JSON.parse(saved)
    if (!parsed || typeof parsed !== 'object') throw new Error('Ungültiges Format.')
    const values = parsed as Record<string, unknown>
    return {
      heroTitle: typeof values.heroTitle === 'string' ? values.heroTitle : defaultSiteContent.heroTitle,
      heroDescription: typeof values.heroDescription === 'string' ? values.heroDescription : defaultSiteContent.heroDescription,
      heroCallToAction: typeof values.heroCallToAction === 'string' ? values.heroCallToAction : defaultSiteContent.heroCallToAction,
      introTitle: typeof values.introTitle === 'string' ? values.introTitle : defaultSiteContent.introTitle,
      introDescription: typeof values.introDescription === 'string' ? values.introDescription : defaultSiteContent.introDescription,
    }
  } catch (error) {
    console.error('Die gespeicherten Website-Inhalte konnten nicht gelesen werden.', error)
    return defaultSiteContent
  }
}

export function saveSiteContent(content: SiteContent) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(content))
  } catch (error) {
    console.error('Die Website-Inhalte konnten nicht lokal gespeichert werden.', error)
    throw new Error('Die Inhalte konnten nicht gespeichert werden. Bitte prüfen Sie den verfügbaren Browser-Speicher.')
  }
}
