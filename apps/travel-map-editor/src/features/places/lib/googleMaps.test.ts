import assert from "node:assert/strict";

import { parseGoogleMapsUrl } from "./googleMaps.ts";

/**
 * Checks every Google Maps link shape the editor accepts, and the ones it must
 * reject rather than guess at.
 * @returns {void}
 */
function run(): void {
  const place = parseGoogleMapsUrl(
    "https://www.google.com/maps/place/Colosseum/@41.8902102,12.4900422,17z/data=!3m1!4b1!4m6!3m5!1s0x0:0x0!8m2!3d41.8902102!4d12.4922309",
  );
  assert.deepEqual(place?.coordinates, [12.4922309, 41.8902102]);
  assert.equal(place?.name, "Colosseum");

  // The viewport centre is the fallback when there is no place pin.
  assert.deepEqual(
    parseGoogleMapsUrl("https://www.google.com/maps/@41.9028,12.4964,15z")
      ?.coordinates,
    [12.4964, 41.9028],
  );

  assert.deepEqual(
    parseGoogleMapsUrl("https://maps.google.com/?q=41.9028,12.4964")
      ?.coordinates,
    [12.4964, 41.9028],
  );

  assert.deepEqual(
    parseGoogleMapsUrl(
      "https://www.google.com/maps/search/?api=1&query=-33.8688,151.2093",
    )?.coordinates,
    [151.2093, -33.8688],
  );

  // A bare pair copied out of the coordinates readout.
  assert.deepEqual(
    parseGoogleMapsUrl(" -33.8688 , 151.2093 ")?.coordinates,
    [151.2093, -33.8688],
  );

  // Percent-encoded names round-trip.
  assert.equal(
    parseGoogleMapsUrl(
      "https://www.google.com/maps/place/Reykjav%C3%ADk/@64.1466,-21.9426,12z",
    )?.name,
    "Reykjavík",
  );

  // Out-of-range values are rejected instead of silently stored.
  assert.equal(parseGoogleMapsUrl("999.0, 12.0"), undefined);
  assert.equal(parseGoogleMapsUrl("41.9, 999.0"), undefined);

  // A short link carries no coordinates, so it must not resolve to a guess.
  assert.equal(parseGoogleMapsUrl("https://maps.app.goo.gl/abc123"), undefined);
  assert.equal(parseGoogleMapsUrl(""), undefined);
  assert.equal(parseGoogleMapsUrl("not a link"), undefined);

  console.log("geo: all assertions passed");
}

run();
