import { lazy } from "react";

const Backdrop = lazy(() => import("./Backdrop/Backdrop"));
const Button = lazy(() => import("./Buttons/Button"));
const CloseButton = lazy(() => import("./Buttons/CloseButton"));
const DarkModeButton = lazy(() => import("./Buttons/DarkModeButton"));
const CountryFlag = lazy(() => import("./CountryFlag/CountryFlag"));
const FlightsDonutChart = lazy(() => import("./DonutChart/DonutChartFlights"));
const LanguageFlag = lazy(() => import("./LanguageFlag/LanguageFlag"));
const Loading = lazy(() => import("./Loading/Loading"));
const LoadingCircles = lazy(() => import("./Loading/LoadingCircles"));
const Marker = lazy(() => import("./Marker/Marker"));

export {
  Backdrop,
  Button,
  CloseButton,
  DarkModeButton,
  FlightsDonutChart,
  CountryFlag,
  LanguageFlag,
  Loading,
  LoadingCircles,
  Marker,
};
