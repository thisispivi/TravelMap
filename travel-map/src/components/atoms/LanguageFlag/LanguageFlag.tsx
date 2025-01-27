import {
  GermanyFlag,
  HungaryFlag,
  ItalyFlag,
  SpainFlag,
  UnitedKingdomFlag,
  JapanFlag,
  PortugalFlag,
  MaltaFlag,
} from "../../../assets";
import { JSX } from "react";

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
 * @returns {JSX.Element|null} The language flag
 */
export default function LanguageFlag({
  language,
  className = "",
}: LanguageFlagProps): JSX.Element | null {
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
