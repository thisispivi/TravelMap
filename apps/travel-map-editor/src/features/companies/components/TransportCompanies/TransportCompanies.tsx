import "./TransportCompanies.scss";

import { Company, CompanyModeSchema, SiteConfig } from "@travelmap/core";
import { Button } from "@travelmap/ui/components/Button/Button";
import { EmptyState } from "@travelmap/ui/components/EmptyState/EmptyState";
import { PanelFrame } from "@travelmap/ui/components/PanelFrame/PanelFrame";
import { PanelHeader } from "@travelmap/ui/components/PanelHeader/PanelHeader";
import { TransportModeIcon } from "@travelmap/ui/components/TransportModeIcon/TransportModeIcon";
import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import { classNames } from "@travelmap/ui/lib/classNames";
import { Building2, ChevronDown, Plus, Trash2 } from "lucide-react";
import { ReactNode, useState } from "react";

import { resolveLogoUrl } from "@/data/dataset";
import { idError } from "@/data/paths";
import { DataFile, saveDocument } from "@/data/store";
import { Combobox } from "@/shared/components/Combobox/Combobox";
import { useConfirm } from "@/shared/components/ConfirmDialog/ConfirmDialog";
import { TextField } from "@/shared/components/Fields/Fields";
import { ImageUploadField } from "@/shared/components/ImageUploadField/ImageUploadField";
import { useToast } from "@/shared/components/Toast/Toast";
import { useMapScene } from "@/shared/context/MapScene.context";
import { useAutosave } from "@/shared/hooks/useAutosave";
import { useDataset } from "@/shared/hooks/useDataset";
import { isSameJson } from "@/shared/lib/jsonEquality";

import { companyRides } from "../../lib/companyRides";

/**
 * TransportCompanies component
 * Provides a dedicated catalogue for adding, editing, and removing transport
 * operators. Changes autosave into the site configuration with the same
 * conflict protection as the rest of the editor.
 * @component
 * @param {TransportCompaniesProps} props
 * @param {DataFile<SiteConfig>} props.file - Site configuration document
 * @returns {ReactNode} The transport-company editor
 */
export function TransportCompanies({
  file,
}: TransportCompaniesProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const { confirm, confirmDialog } = useConfirm();
  const { showToast } = useToast();
  const [companies, setCompanies] = useState(file.value.companies ?? {});
  const [newCompanyId, setNewCompanyId] = useState("");
  const isDirty = !isSameJson(companies, file.value.companies ?? {});
  useAutosave(
    companies,
    () => saveDocument(file.path, { ...file.value, companies }),
    isDirty,
    { onSaved: () => showToast(t("toast.companiesSaved")) },
  );
  const companyIdProblem = idError(newCompanyId, Object.keys(companies));
  const companyIdMessage = companyIdProblem
    ? t(`idProblem.${companyIdProblem.code}`, { id: companyIdProblem.id })
    : null;
  const entries = Object.entries(companies).toSorted((first, second) =>
    first[1].name.localeCompare(second[1].name),
  );
  const [openId, setOpenId] = useState<string | undefined>();
  const dataset = useDataset();
  const cityById = new Map(
    dataset.cities.map(({ value }) => [value.id, value] as const),
  );
  const ridesByCompany = companyRides(dataset.trips, cityById);
  const openRides = openId ? (ridesByCompany.get(openId) ?? []) : [];

  /* The open company's rides on the map: every flight or crossing with it. */
  useMapScene({
    frame: openRides.flatMap(({ from, to }) => [from, to]),
    pins: [],
    routes: openRides,
  });

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
   * Adds an empty company entry after its stable identifier is validated, and
   * opens it, since it still needs a type, a name and a logo.
   * @returns {void}
   */
  function addCompany(): void {
    if (companyIdProblem) return;
    setCompany(newCompanyId, { name: newCompanyId });
    setOpenId(newCompanyId);
    setNewCompanyId("");
  }

  return (
    <PanelFrame
      header={
        <PanelHeader
          subtitle={t("library.companyCount", { count: entries.length })}
          title={t("nav.companies")}
        >
          <div className="transport-companies__add">
            <TextField
              hint={
                newCompanyId
                  ? (companyIdMessage ?? t("companyEditor.readyToAdd"))
                  : t("companyEditor.hint")
              }
              label={t("companyEditor.addCompanyId")}
              onChange={setNewCompanyId}
              placeholder="ryanair"
              value={newCompanyId}
            />
            <Button
              disabled={Boolean(companyIdProblem)}
              onClick={addCompany}
              variant="primary"
            >
              <Plus aria-hidden="true" />
              {t("companyEditor.add")}
            </Button>
          </div>
        </PanelHeader>
      }
    >
      {confirmDialog}
      {entries.length > 0 ? (
        <ul className="transport-companies">
          {entries.map(([id, company]) => {
            const isOpen = id === openId;
            const logo = resolveLogoUrl(company.logo);
            return (
              <li
                className={classNames(
                  "transport-companies__company",
                  isOpen && "transport-companies__company--open",
                )}
                key={id}
              >
                <button
                  aria-expanded={isOpen}
                  className="transport-companies__summary-row"
                  onClick={() => setOpenId(isOpen ? undefined : id)}
                  type="button"
                >
                  {logo ? (
                    <img
                      alt=""
                      aria-hidden="true"
                      className="transport-companies__logo"
                      src={logo}
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="transport-companies__logo"
                    >
                      <Building2 />
                    </span>
                  )}
                  <span className="transport-companies__name">
                    {company.name || id}
                    <code className="transport-companies__id">{id}</code>
                  </span>
                  {company.mode ? (
                    <TransportModeIcon
                      className="transport-companies__mode"
                      mode={company.mode}
                    />
                  ) : null}
                  <span className="transport-companies__rides">
                    {t("companyEditor.rideCount", {
                      count: ridesByCompany.get(id)?.length ?? 0,
                    })}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className="transport-companies__chevron"
                  />
                </button>
                {isOpen ? (
                  <div className="transport-companies__form">
                    <TextField
                      label={t("companyEditor.name")}
                      onChange={(name) => setCompany(id, { ...company, name })}
                      value={company.name}
                    />
                    <Combobox
                      emptyLabel={t("companyEditor.anyMode")}
                      label={t("companyEditor.mode")}
                      onChange={(next) =>
                        setCompany(id, {
                          ...company,
                          mode: CompanyModeSchema.options.find(
                            (mode) => mode === next,
                          ),
                        })
                      }
                      options={CompanyModeSchema.options.map((mode) => ({
                        label: t(`companyEditor.modes.${mode}`),
                        value: mode,
                      }))}
                      value={company.mode ?? ""}
                    />
                    <ImageUploadField
                      fileNameHint={id}
                      label={t("companyEditor.logo")}
                      onClear={() =>
                        setCompany(id, { ...company, logo: undefined })
                      }
                      onUpload={(next) =>
                        setCompany(id, { ...company, logo: next })
                      }
                      value={logo}
                    />
                    <Button
                      className="transport-companies__remove"
                      onClick={() =>
                        confirm({
                          confirmLabel: t("confirm.removeCompany.action"),
                          isDanger: true,
                          message: t("confirm.removeCompany.message"),
                          onConfirm: () => removeCompany(id),
                          title: t("confirm.removeCompany.title", {
                            name: company.name || id,
                          }),
                        })
                      }
                      variant="danger"
                    >
                      <Trash2 aria-hidden="true" />
                      {t("companyEditor.removeCompany", { id })}
                    </Button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState message={t("companyEditor.empty")} />
      )}
    </PanelFrame>
  );
}

/**
 * Props for TransportCompanies.
 * @property {DataFile<SiteConfig>} file - Site configuration document
 */
interface TransportCompaniesProps {
  file: DataFile<SiteConfig>;
}
