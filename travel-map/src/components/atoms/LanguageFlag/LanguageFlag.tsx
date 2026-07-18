import { ReactNode } from "react";

import GermanyFlag from "@/assets/icons/flags/Germany.svg?react";
import HungaryFlag from "@/assets/icons/flags/Hungary.svg?react";
import ItalyFlag from "@/assets/icons/flags/Italy.svg?react";
import JapanFlag from "@/assets/icons/flags/Japan.svg?react";
import MaltaFlag from "@/assets/icons/flags/Malta.svg?react";
import PortugalFlag from "@/assets/icons/flags/Portugal.svg?react";
import SpainFlag from "@/assets/icons/flags/Spain.svg?react";
import UnitedKingdomFlag from "@/assets/icons/flags/UnitedKingdom.svg?react";

interface LanguageFlagProps {
  language: string;
  className?: string;
}

/**
 * LanguageFlag component
 *
 * Given the current i18n language, it returns the flag of the language
 *
 * @component
 *
 * @param {LanguageFlagProps} props - The props of the component
 * @param {string} props.language - The current language
 * @param {string} props.className - The class to apply to the flag
 *
 * @returns {ReactNode} The language flag
 */
export function LanguageFlag({
  language,
  className = "",
}: LanguageFlagProps): ReactNode {
  if (language.includes("it")) return <ItalyFlag className={className} />;
  if (language.includes("en"))
    return <UnitedKingdomFlag className={className} />;
  if (language.includes("de")) return <GermanyFlag className={className} />;
  if (language.includes("es")) return <SpainFlag className={className} />;
  if (language.includes("hu")) return <HungaryFlag className={className} />;
  if (language.includes("ja")) return <JapanFlag className={className} />;
  if (language.includes("pt")) return <PortugalFlag className={className} />;
  if (language.includes("mt")) return <MaltaFlag className={className} />;
  return null;
}
