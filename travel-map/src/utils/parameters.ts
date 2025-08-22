import { Muravera } from "../data/Italy/Muravera/Muravera";

export const constants = {
  TOTAL_COUNTRIES: 195,
  TOTAL_UNESCO_SITES: 1223,
  EARTH_CIRCUMFERENCE: 40075,
  MOON_DISTANCE: 384400,
  GROUP_BY_CITIES_CUTOFF_YEAR: 2023,
  GROUP_BY_CITIES_DEFAULT_OPENED_YEAR: 2025,
};

export const parameters = {
  isShowPhotos: true, // Used to show or hide the photos on the city card and not waste cdn bandwidth
  map: {
    defaultZoom: 4,
    defaultMinZoom: 1,
    defaultMaxZoom: 150,
    defaultCenter: [4, 48] as [number, number],
    hoveredCityZoom: 100,
    marker: {
      defaultScale: 0.15,
      minScale: 0.05,
      maxScale: 0.2,
    },
  },
  cdnPath: "https://pivi-travel-map.b-cdn.net/TravelMap/",
  birthCity: Muravera,
  stats: {
    unescoSites: {
      Austria: [
        "Palace and Gardens of Schönbrunn",
        "Historic Centre of Vienna",
      ],
      Belgium: [
        "Flemish Béguinages",
        "La Grand-Place, Brussels",
        "Belfries of Belgium and France",
        "Historic Centre of Brugge",
        "Major Town Houses of the Architect Victor Horta (Brussels)",
      ],
      Germany: ["Museumsinsel (Museum Island), Berlin"],
      Hungary: [
        "Budapest, including the Banks of the Danube, the Buda Castle Quarter and Andrássy Avenue",
      ],
      Japan: [
        "Himeji-jo",
        "Historic Monuments of Ancient Kyoto (Kyoto, Uji and Otsu Cities)",
        "Historic Villages of Shirakawa-go and Gokayama",
        "Historic Monuments of Ancient Nara",
        "Fujisan, sacred place and source of artistic inspiration",
      ],
      Malta: ["City of Valletta"],
      Portugal: [
        "Historic Centre of Oporto, Luiz I Bridge and Monastery of Serra do Pilar",
        "Sanctuary of Bom Jesus do Monte in Braga",
      ],
      Spain: [
        "Works of Antoni Gaudí 25",
        "Cathedral, Alcázar and Archivo de Indias in Seville",
        "Palau de la Música Catalana and Hospital de Sant Pau, Barcelona",
      ],
      "United Kingdom of Great Britain and Northern Ireland": [
        "Stonehenge, Avebury and Associated Sites",
        "Palace of Westminster and Westminster Abbey including Saint Margaret's Church",
        "Tower of London",
      ],
      Italy: [
        "Historic Centre of Rome, the Properties of the Holy See in that City Enjoying Extraterritorial Rights and San Paolo Fuori le Mura * 14",
        "Piazza del Duomo, Pisa",
        "Venice and its Lagoon",
        "City of Vicenza and the Palladian Villas of the Veneto",
        "Ferrara, City of the Renaissance, and its Po Delta 15",
        "Archaeological Area of Agrigento",
        "Botanical Garden (Orto Botanico), Padua",
        "Residences of the Royal House of Savoy",
        "Su Nuraxi di Barumini",
        "Assisi, the Basilica of San Francesco and Other Franciscan Sites",
        "City of Verona",
        "Late Baroque Towns of the Val di Noto (South-Eastern Sicily)",
        "Syracuse and the Rocky Necropolis of Pantalica",
        "Genoa: Le Strade Nuove and the system of the Palazzi dei Rolli",
        "Arab-Norman Palermo and the Cathedral Churches of Cefalú and Monreale",
        "Venetian Works of Defence between the 16th and 17th Centuries: Stato da Terra - Western Stato da Mar *",
        "Padua's fourteenth-century fresco cycles",
        "The Porticoes of Bologna",
      ],
    },
  },
};
