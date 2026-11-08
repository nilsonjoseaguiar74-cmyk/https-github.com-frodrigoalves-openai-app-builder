# STEINPLATTE

Frontend-Demo für einen österreichischen Shop für Mineralien, Edelsteine,
Schmuck und alpine Produkte. Die Oberfläche ist auf Deutsch (Österreich)
gestaltet und verwendet React, TypeScript, Vite und TanStack Router.

## Lokal starten

```sh
npm install
npm run dev
```

## Verfügbare Prüfungen

```sh
npm run typecheck
npm run build
```

## Demo-Bereich

Die öffentliche Website ist unter `/` erreichbar, die Verwaltung unter
`/verwaltung`. Der Demo-Login ist unter `/verwaltung/anmelden` erreichbar.
Produkte, Warenkorb und Lagerbewegungen werden lokal im Browser gespeichert.
Die Sitzung ist nur eine Navigationsdemo und keine echte Authentifizierung.
Es gibt keine Bestellabwicklung, Zahlung oder Backend-Verbindung.
Die Produktverwaltung bietet einen JSON-Export der Demo-Produkte inklusive
lokal gespeicherter Produktbilder.

Die verwendeten Mineralfotografien stammen aus Wikimedia Commons und stehen
unter den jeweiligen freien Lizenzen. Wo kein passendes Produktfoto vorhanden
ist, zeigt der Shop „Bild folgt“. Vollständige Bildnachweise sind unter
`/image-credits.txt` veröffentlicht.

Für die geplante Editorial-Aktualisierung der Homepage werden noch
`public/images/hero-rauchquarz-editorial.webp` und
`public/images/intro-fluorit-editorial.webp` benötigt. Bis passende Assets
vorliegen, bleiben die bestehenden Referenzen `smoky-quartz.webp` und
`fluorite-specimen.jpg` unverändert; es werden keine Ersatzbilder zugeordnet.

## SEO und Indexierung

Seitentitel und SEO-Metadaten für öffentliche Seiten werden bei der Navigation
clientseitig über den TanStack Router aktualisiert. Die öffentliche Sitemap
liegt unter `/sitemap.xml`; `/warenkorb` und `/verwaltung` sind in `robots.txt`
von der Indexierung ausgeschlossen. Produktseiten werden nicht pauschal in
die Sitemap aufgenommen, da Produktdaten lokal im Browser gepflegt werden.

Die Anwendung ist eine React/Vite-SPA. Suchmaschinen und andere Crawler, die
JavaScript nicht ausführen, sehen nur die statischen Metadaten aus
`index.html`, nicht die individuellen Metadaten jeder Route. Für zuverlässige
route-spezifische Vorschauen und Indexierung durch solche Crawler ist
Prerendering oder serverseitiges Rendering erforderlich.