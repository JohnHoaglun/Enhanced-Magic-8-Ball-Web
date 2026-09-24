import raw from "../data/catalog.json";

export type OutcomeCategory = "yes" | "maybe" | "no";

export interface Catalog {
  id: string;
  name: string;
  answers: Record<OutcomeCategory, string[]>;
}

const catalog = raw as Catalog;

export function loadCatalog(): Catalog {
  return catalog;
}
