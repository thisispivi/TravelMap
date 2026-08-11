/*
 * stopword ships no type declarations. Only the entry points this app uses are
 * declared, so an upgrade that reshapes the rest of the API cannot pass unseen.
 */
declare module "stopword" {
  export const eng: string[];
  export const ita: string[];
  export function removeStopwords(
    tokens: string[],
    stopwords?: string[],
  ): string[];
}
