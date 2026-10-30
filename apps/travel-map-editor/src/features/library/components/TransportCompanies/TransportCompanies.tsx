import "./TransportCompanies.scss";

import { PanelFrame } from "@app/shared/components/PanelFrame/PanelFrame";
import { useLanguage } from "@app/shared/hooks/useLanguage";
import { classNames } from "@app/shared/lib/classNames";
import {
  CityJson,
  Company,
  SiteConfig,
  TripJson,
  walkTripLegs,
} from "@travelmap/core";
import { Building2, ChevronDown, Plus, Trash2 } from "lucide-react";
import { ReactNode, useState } from "react";

import { resolveLogoUrl } from "../../../../data/dataset";
import { idError } from "../../../../data/paths";
import { DataFile, saveDocument } from "../../../../data/store";
import { useConfirm } from "../../../../shared/components/ConfirmDialog/ConfirmDialog";
import { TextField } from "../../../../shared/components/Fields/Fields";
import { ImageUploadField } from "../../../../shared/components/ImageUploadField/ImageUploadField";
import { useToast } from "../../../../shared/components/Toast/Toast";
import {
  MapRoute,
  useMapScene,
} from "../../../../shared/context/MapScene.context";
import { useAutosave } from "../../../../shared/hooks/useAutosave";
import { useDataset } from "../../../../shared/hooks/useDataset";
import { isSameJson } from "../../../../shared/lib/jsonEquality";

/**
 * Gathers every ride made with each operator across all trips, as map lines:
 * a flight by its airline, a crossing by its ferry line.
 * @param {DataFile<TripJson>[]} trips - Every trip document
 * @param {Map<string, CityJson>} cityById - The dataset's cities
 * @returns {Map<string, MapRoute[]>} Rides by operator id
 */
function companyRides(
  trips: DataFile<TripJson>[],
  cityById: Map<string, CityJson>,
): Map<string, MapRoute[]> {
  const rides = new Map<string, MapRoute[]>();
  for (const { value: trip } of trips)
    for (const { fromId, index, leg, legIndex, outing } of walkTripLegs(trip)) {
      const operator = leg.flight?.company ?? leg.ferry?.company;
      const from = cityById.get(fromId);
      const to = cityById.get(leg.toId);
      if (!operator || !from || !to) continue;
      rides.set(operator, [
        ...(rides.get(operator) ?? []),
        {
          from: from.coordinates,
          id: `${trip.id}:${index}:${outing ?? ""}:${legIndex}`,
          isOuting: outing !== undefined,
          mode: leg.mode,
          to: to.coordinates,
        },
      ]);
    }
  return rides;
}

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
   * Adds an empty company entry after its stable identifier is validated.
   * @returns {void}
   */
  function addCompany(): void {
    if (companyIdProblem) return;
    setCompany(newCompanyId, { name: newCompanyId });
    setNewCompanyId("");
  }

  return (
    <PanelFrame
      header={
        <header className="transport-companies__header">
          <div>
            <h2>{t("nav.companies")}</h2>
            <p className="transport-companies__summary">
              {t("library.companyCount", { count: entries.length })}
            </p>
          </div>
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
        </header>
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
                    <button
                      className="editor-button editor-button--danger transport-companies__remove"
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
                      type="button"
                    >
                      <Trash2 aria-hidden="true" />
                      {t("companyEditor.removeCompany", { id })}
                    </button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="transport-companies__empty">
          <Building2 aria-hidden="true" />
          {t("companyEditor.empty")}
        </p>
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
