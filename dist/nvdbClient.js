// Default to production NVDB API URL
let baseUrl = "https://nvdbapiles.atlas.vegvesen.no"; // PROD
// Headers for NVDB API requests
const NVDB_HEADERS = { "Accept": "application/json", "X-Client": "nvdb-vegref-client" };
// Function to set a custom base URL for NVDB API
export function setNvdbBaseUrl(url) {
    baseUrl = url;
}
export const fetchHistoricVegreferanse = async (vegreferanse, tidspunkt) => {
    const url = baseUrl + "/vegobjekter/532";
    const params = new URLSearchParams({
        inkludergeometri: "ingen",
        inkluder: "egenskaper,lokasjon,metadata",
        ...(tidspunkt
            ? { tidspunkt: tidspunkt.toISOString().slice(0, 10) }
            : { alle_versjoner: "true" }),
        egenskap: `(4566=${vegreferanse.vegkategori})`
            + `AND(4567=${vegreferanse.vegstatus})`
            + `AND(4568=${vegreferanse.vegnummer})`
            + `AND(4569=${vegreferanse.parsell})`
            + `AND(4571<${vegreferanse.meter + 1})`
            + `AND(4572>${vegreferanse.meter - 1})`
            + `AND(4591=${vegreferanse.fylke})`
            + `AND(4592=${vegreferanse.kommune})`
    });
    console.log(`Fetching historic road object (typeid=532) from: ${url}?${params}`);
    const response = await fetch(`${url}?${params.toString()}`, {
        method: "GET",
        mode: 'cors',
        headers: NVDB_HEADERS
    });
    if (!response.ok) {
        console.log("Response not ok:", response.status, response.statusText);
        return {
            objekter: [],
            metadata: {
                antallTreffTotalt: 0,
                antallTreffPerSide: 0,
                side: 0,
                antallSider: 0
            },
        };
    }
    return await response.json();
};
export const fetchVegsystemReferanse = async (veglenkesekvensid, position) => {
    const url = baseUrl + "/veg";
    const params = new URLSearchParams({
        veglenkesekvens: `${position}@${veglenkesekvensid}`
    });
    console.log(`Fetching current road position (vegsystemreferanse) from: ${url}?${params}`);
    const response = await fetch(`${url}?${params.toString()}`, {
        method: "GET",
        mode: 'cors',
        headers: NVDB_HEADERS
    });
    if (!response.ok) {
        console.log("Response not ok:", response.status, response.statusText);
        return {};
    }
    return await response.json();
};
export const fetchPosisjonByVegsystemreferanse = async (vegsystemreferanse, tidspunkt) => {
    const url = baseUrl + "/veg";
    const params = new URLSearchParams({
        vegsystemreferanse: `${vegsystemreferanse}`,
        ...(tidspunkt ? { tidspunkt: tidspunkt.toISOString().slice(0, 10) } : {})
    });
    console.log(`Fetching current road position (vegsystemreferanse) from: ${url}?${params}`);
    const response = await fetch(`${url}?${params.toString()}`, {
        method: "GET",
        mode: 'cors',
        headers: NVDB_HEADERS
    });
    if (!response.ok) {
        console.log("Response not ok:", response.status, response.statusText);
        return {};
    }
    return await response.json();
};
export const fetchPositionByLenkeposisjon = async (veglenksekvensid, posisjon, tidspunkt) => {
    const url = baseUrl + "/veg";
    const params = new URLSearchParams({
        veglenkesekvens: `${posisjon}@${veglenksekvensid}`,
        ...(tidspunkt ? { tidspunkt: tidspunkt.toISOString().slice(0, 10) } : {})
    });
    console.log(`Fetching current road position (vegsystemreferanse) from: ${url}?${params}`);
    const response = await fetch(`${url}?${params.toString()}`, {
        method: "GET",
        mode: 'cors',
        headers: NVDB_HEADERS
    });
    if (!response.ok) {
        console.log("Response not ok:", response.status, response.statusText);
        return {};
    }
    return await response.json();
};
export const fetchPositionByNordOst = async (nord, ost, tidspunkt) => {
    const url = baseUrl + "/posisjon";
    const params = new URLSearchParams({
        nord: `${nord}`,
        ost: `${ost}`,
        ...(tidspunkt ? { tidspunkt: tidspunkt.toISOString().slice(0, 10) } : {})
    });
    console.log(`Fetching  position by nord and ost: ${url}?${params}`);
    const response = await fetch(`${url}?${params.toString()}`, {
        method: "GET",
        mode: 'cors',
        headers: NVDB_HEADERS
    });
    if (!response.ok) {
        console.log("Response not ok:", response.status, response.statusText);
        return {};
    }
    return await response.json();
};
export const fetchHistoricVegreferanseByPosition = async (veglenksekvensId, posisjon, tidspunkt) => {
    const url = baseUrl + "/vegobjekter/532";
    const params = new URLSearchParams({
        segmentering: "true",
        inkluder: "egenskaper,lokasjon,metadata",
        veglenkesekvens: `${posisjon}@${veglenksekvensId}`,
        ...(tidspunkt
            ? { tidspunkt: tidspunkt.toISOString().slice(0, 10) }
            : { alle_versjoner: "true" })
    });
    console.log(`Fetching historic road object (typeid=532) from: ${url}?${params} for veglenkesekvensId=${veglenksekvensId} at posisjon=${posisjon}`);
    const response = await fetch(`${url}?${params.toString()}`, {
        method: "GET",
        mode: 'cors',
        headers: NVDB_HEADERS
    });
    if (!response.ok) {
        console.log("Response not ok:", response.status, response.statusText);
    }
    return await response.json();
};
//# sourceMappingURL=nvdbClient.js.map