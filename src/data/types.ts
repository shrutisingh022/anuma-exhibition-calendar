export type ExpoStatus = "confirmed" | "listed" | "expected"

export interface Expo {
  id: string
  name: string
  startDate: string
  endDate: string
  city: string
  state: string
  venue: string
  organiser: string
  sectors: string[]
  frequency: "annual" | "biennial" | "other"
  website: string
  sourceUrl: string
  status: ExpoStatus
  exhibitors: number | null
  notes: string
}

export const STATUS_LABEL: Record<ExpoStatus, string> = {
  confirmed: "Confirmed",
  listed: "Listed",
  expected: "Expected",
}

export const STATUS_HINT: Record<ExpoStatus, string> = {
  confirmed: "Dates on the organiser's official site",
  listed: "Dates from a directory, not yet on the official site",
  expected: "Edition announced, exact dates not published",
}

export const SECTORS = [
  "Machine tools & metalworking",
  "Welding & fabrication",
  "Foundry & casting",
  "Steel, metals & mining",
  "General engineering",
  "Automotive & auto components",
  "Electric vehicles",
  "Aerospace & defence",
  "Industrial automation",
  "Electronics & semiconductors",
  "Electrical & power",
  "Renewable energy",
  "HVAC & refrigeration",
  "Water & environment",
  "Plastics & rubber",
  "Packaging & printing",
  "Chemicals & coatings",
  "Pharma & medical devices",
  "Paper & glass",
  "Textiles & apparel",
  "Food processing & dairy",
  "Agri machinery",
  "Furniture & wood",
  "Leather & footwear",
  "Construction & building materials",
  "Gems & jewellery",
  "Logistics & material handling",
  "Toys & consumer goods",
] as const
