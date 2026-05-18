import archiveData from "@/data/archive-projects.json";
import { projectCatalog } from "@/lib/project-catalog";

type ArchiveFile = { items: { location?: string; geo_region?: string }[] };

const STATIC_LOCATIONS = [
  "India",
  "Maharashtra",
  "Karnataka",
  "Kerala",
  "Tamil Nadu",
  "Rajasthan",
  "Gujarat",
  "Telangana",
  "West Bengal",
  "Delhi",
  "Mumbai",
  "Bengaluru",
  "Chennai",
  "Hyderabad",
  "Kochi",
  "Jaipur",
  "Ahmedabad",
  "Kolkata",
  "Pune",
  "Singapore",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
] as const;

function splitGeoParts(value: string): string[] {
  return value
    .split(/[,|/]/)
    .map((p) => p.trim())
    .filter((p) => p.length >= 2);
}

function collectLocations(): string[] {
  const set = new Set<string>(STATIC_LOCATIONS);

  for (const p of projectCatalog) {
    if (p.location?.trim()) set.add(p.location.trim());
  }

  const items = (archiveData as ArchiveFile).items ?? [];
  for (const item of items) {
    if (item.location?.trim()) {
      set.add(item.location.trim());
      for (const part of splitGeoParts(item.location)) set.add(part);
    }
    if (item.geo_region?.trim()) {
      for (const part of splitGeoParts(item.geo_region)) set.add(part);
    }
  }

  return [...set].sort((a, b) => a.localeCompare(b));
}

const ALL_LOCATIONS = collectLocations();

export function filterLocationSuggestions(query: string, limit = 12): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return ALL_LOCATIONS.slice(0, limit);
  return ALL_LOCATIONS.filter((loc) => loc.toLowerCase().includes(q)).slice(0, limit);
}

export function locationSuggestionsCount(): number {
  return ALL_LOCATIONS.length;
}
