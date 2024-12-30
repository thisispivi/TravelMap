import { lazy } from "react";

const Box = lazy(() => import("./Box/Box"));
const Card = lazy(() => import("./Cards/Card"));
const Column = lazy(() => import("./Column/Column"));
const CityCard = lazy(() => import("./Cards/CityCard"));
const Container = lazy(() => import("./Container/Container"));
const FilterCountry = lazy(() => import("./FilterCountry/FilterCountry"));
const Row = lazy(() => import("./Row/Row"));
const CityRow = lazy(() => import("./Row/RowCity"));
const ContinentRow = lazy(() => import("./Row/RowContinent"));
const ContinentCitiesRow = lazy(() => import("./Row/RowContinentCities"));
const FlightRow = lazy(() => import("./Row/RowFlight"));
const TravelSelector = lazy(() => import("./TravelSelector/TravelSelector"));

export {
  Box,
  Card,
  Column,
  CityCard,
  Container,
  FilterCountry,
  Row,
  CityRow,
  ContinentRow,
  ContinentCitiesRow,
  TravelSelector,
  FlightRow,
};
