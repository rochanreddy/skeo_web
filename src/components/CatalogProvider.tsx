'use client'

import { createContext, useContext } from 'react'
import { defaultCatalog, type Catalog } from '@/lib/catalog'

/**
 * The catalog the server rendered the page with, handed to the browser.
 *
 * The root layout reads it once (lib/cms) and passes it here, so a client
 * component — the cart, the checkout, the countdown — shows exactly the price
 * and deadline the server-rendered sections beside it show. Importing PLANS
 * directly in a client component would bake the code's numbers into the
 * bundle and ignore anything edited in Sanity.
 */
const CatalogContext = createContext<Catalog>(defaultCatalog)

export function CatalogProvider({ catalog, children }: { catalog: Catalog; children: React.ReactNode }) {
  return <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>
}

export const useCatalog = () => useContext(CatalogContext)
