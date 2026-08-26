import { createHashRouter, Navigate } from "react-router";

import { Journey } from "@/features/ledger/components/Journey/Journey";
import { Ledger } from "@/features/ledger/components/Ledger/Ledger";
import { Place } from "@/features/ledger/components/Place/Place";

import { Record } from "../shell/Record";
import { FallbackPage } from "./FallbackPage";

/*
 * The record is one column read at two scales, so the routes carry position
 * rather than pages. A stay's photographs get a path because they are worth
 * linking to, but no element: they are drawn on the plate by the shell, which
 * sits above this route and reads the pathname directly.
 */
export const router = createHashRouter([
  {
    path: "/",
    element: <Record />,
    errorElement: <FallbackPage />,
    children: [
      { index: true, element: <Ledger /> },
      {
        path: "journey/:tripId",
        element: <Journey />,
        children: [{ path: ":spanIndex", element: null }],
      },
      { path: "place/:cityId", element: <Place /> },
      { path: "*", element: <Navigate replace to="/" /> },
    ],
  },
]);
