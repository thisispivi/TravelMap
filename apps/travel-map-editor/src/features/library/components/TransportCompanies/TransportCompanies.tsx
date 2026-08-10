import "./TransportCompanies.scss";

import { useLanguage } from "@app/shared/hooks/useLanguage";
import { Building2, Plus, Trash2 } from "lucide-react";
import { ReactNode, useState } from "react";

import { resolveLogoUrl } from "../../../../data/dataset";
import { idError } from "../../../../data/paths";
import { Company, SiteConfig } from "../../../../data/siteConfig";
import { DataFile, saveDocument } from "../../../../data/store";
import { TextField } from "../../../../shared/components/Fields/Fields";
import { ImageUploadField } from "../../../../shared/components/ImageUploadField/ImageUploadField";
import { SaveChip } from "../../../../shared/components/SaveChip/SaveChip";
import { useAutosave } from "../../../../shared/hooks/useAutosave";

/**
 * TransportCompanies component
 * Keeps the operator catalogue beside the trips that use it. Changes autosave
 * into the site configuration with the same conflict protection as the rest of
 * the editor.
 * @component
 * @param {TransportCompaniesProps} props
 * @param {DataFile<SiteConfig>} props.file - Site configuration document
 * @returns {ReactNode} The transport-company editor
 */
export function TransportCompanies({
  file,
}: TransportCompaniesProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const [companies, setCompanies] = useState(file.value.companies ?? {});
  const [newCompanyId, setNewCompanyId] = useState("");
  const isDirty =
    JSON.stringify(companies) !== JSON.stringify(file.value.companies ?? {});
  const save = useAutosave(
    companies,
    () => saveDocument(file.path, { ...file.value, companies }),
    isDirty,
  );
  const companyIdProblem = idError(newCompanyId, Object.keys(companies));
  const companyIdMessage = companyIdProblem
    ? t(`idProblem.${companyIdProblem.code}`, { id: companyIdProblem.id })
    : null;
  const entries = Object.entries(companies).toSorted((first, second) =>
    first[1].name.localeCompare(second[1].name),
  );

  /**
   * Replaces one company while preserving every other catalogue entry.
   * @param {string} id - Company identifier
   * @param {Company} company - Replacement metadata
   * @returns {void}
   */
  function setCompany(id: string, company: Company): void {
    setCompanies((current) => ({ ...current, [id]: company }));
  }

  /**
   * Removes one company from the local catalogue draft.
   * @param {string} id - Company identifier
   * @returns {void}
   */
  function removeCompany(id: string): void {
    setCompanies((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  /**
   * Adds an empty company entry after its stable identifier is validated.
   * @returns {void}
   */
  function addCompany(): void {
    if (companyIdProblem) return;
    setCompany(newCompanyId, { name: newCompanyId });
    setNewCompanyId("");
  }

  return (
    <section className="editor-panel transport-companies">
      <header className="transport-companies__header">
        <div className="transport-companies__heading">
          <span aria-hidden="true" className="transport-companies__icon">
            <Building2 />
          </span>
          <div>
            <h2 className="editor-panel__legend">{t("companyEditor.title")}</h2>
            <p className="editor-panel__hint">{t("companyEditor.hint")}</p>
          </div>
        </div>
        <SaveChip
          error={save.error}
          onRetry={save.retry}
          savedAt={save.savedAt}
          state={save.state}
        />
      </header>
      <div className="transport-companies__add">
        <TextField
          hint={
            newCompanyId
              ? (companyIdMessage ?? t("companyEditor.readyToAdd"))
              : ""
          }
          label={t("companyEditor.addCompanyId")}
          onChange={setNewCompanyId}
          placeholder="ryanair"
          value={newCompanyId}
        />
        <button
          className="editor-button editor-button--primary"
          disabled={Boolean(companyIdProblem)}
          onClick={addCompany}
          type="button"
        >
          <Plus aria-hidden="true" />
          {t("companyEditor.add")}
        </button>
      </div>
      {entries.length > 0 ? (
        <div className="transport-companies__list">
          {entries.map(([id, company]) => (
            <article className="transport-companies__company" key={id}>
              <header className="transport-companies__company-header">
                <code>{id}</code>
                <button
                  aria-label={t("companyEditor.removeCompany", { id })}
                  className="editor-button editor-button--danger"
                  onClick={() => removeCompany(id)}
                  type="button"
                >
                  <Trash2 aria-hidden="true" />
                  {t("companyEditor.remove")}
                </button>
              </header>
              <div className="transport-companies__fields">
                <TextField
                  label={t("companyEditor.name")}
                  onChange={(name) => setCompany(id, { ...company, name })}
                  value={company.name}
                />
                <ImageUploadField
                  fileNameHint={id}
                  hint={t("companyEditor.svgOrPng")}
                  label={t("companyEditor.logo")}
                  onUpload={(logo) => setCompany(id, { ...company, logo })}
                  value={resolveLogoUrl(company.logo)}
                />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="transport-companies__empty">
          <Building2 aria-hidden="true" />
          {t("companyEditor.empty")}
        </p>
      )}
    </section>
  );
}

/**
 * Props for TransportCompanies.
 * @property {DataFile<SiteConfig>} file - Site configuration document
 */
interface TransportCompaniesProps {
  file: DataFile<SiteConfig>;
}
