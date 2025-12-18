import {Vegreferanse} from "./vegreferanse.js";
import type {VegrefAndVegsystemreferanse} from "./nvdbTypes.js";
import {VegrefController} from "./vegrefController.js";
import {UtilClass} from "./utilClass.js";
import * as WKT from 'terraformer-wkt-parser';
import * as L from 'leaflet';
import proj4 from 'proj4';
import 'terraformer-wkt-parser';
import 'proj4leaflet';

// Define UTM33 and WGS84 projections
const UTM33 = '+proj=utm +zone=33 +ellps=GRS80 +units=m +no_defs';
const WGS84 = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';

// Instantiate the controller
var vegrefController = new VegrefController();

// Kommune class to hold kommune data
class Kommune {
    id: number;
    label: string;

    constructor(id: number, label: string) {
        this.id = id;
        this.label = label;
    }
}

// Global variable to store valid kommune numbers
var gyldigeKommuner: Kommune[] = [];

// Initialize the map
const geodataKart = 'https://nvdbcache.geodataonline.no/arcgis/rest/services/Trafikkportalen/GeocacheTrafikkJPG/MapServer/tile/{z}/{y}/{x}'
const geodataFlyfoto = 'https://services.geodataonline.no/arcgis/rest/services/Geocache_UTM33_EUREF89/GeocacheBilder/MapServer/tile/{z}/{y}/{x}'

const kartLayer = L.tileLayer(geodataKart, {
    maxZoom: 16, minZoom: 0, subdomains: '123456789', detectRetina: false,
    attribution: '&copy; NVDB, Geovekst, kommmuene. Kartbakgrunn utenfor Norge: Open street map contributors'
});

// Flyfoto layer
const flyfotoLayer = L.tileLayer(geodataFlyfoto, {
    maxZoom: 16, minZoom: 0, subdomains: '123456789', detectRetina: false,
    attribution: 'Test'
});

// Define custom CRS for UTM33
const crs = new (window as any).L.Proj.CRS('EPSG:25833', '+proj=utm +zone=33 +ellps=GRS80 +units=m +no_defs ',
    {
        origin: [-2500000.0, 9045984.0],
        resolutions: [
            21674.7100160867,
            10837.35500804335,
            5418.677504021675,
            2709.3387520108377,
            1354.6693760054188,
            677.3346880027094,
            338.6673440013547,
            169.33367200067735,
            84.66683600033868,
            42.33341800016934,
            21.16670900008467,
            10.583354500042335,
            5.291677250021167,
            2.6458386250105836,
            1.3229193125052918,
            0.6614596562526459,
            0.33072982812632296
        ]
    });

// Base maps for layer control
var baseMaps = {
    "Trafikkportalen": kartLayer,
    "Flyfoto": flyfotoLayer,
};

// Create the map instance
var map = L.map('map', {
    zoom: 6, center: [63.43, 10.40], crs: crs, worldCopyJump: false, zoomControl: false, attributionControl: true,
    layers: [kartLayer]
});
(window as any).leafletMap = map;

// Add zoom control to the map
L.control.layers(baseMaps).addTo(map);

const markers: L.Marker[] = [];

// Set the map container cursor to crosshair
(document.getElementById('map') as HTMLElement).style.cursor = 'crosshair';

map.on('click', function (e: L.LeafletMouseEvent) {
    const latlng = e.latlng;
    const utm33 = proj4(WGS84, UTM33, [latlng.lng, latlng.lat]);
    const easting = utm33[0];
    const northing = utm33[1];

    if (easting && northing) {
        showLoading();
        vegrefController.findPosisjonerByCoordinates(northing, easting, undefined)
            .then(result => {
                displayResults(result);
            })
            .catch(error => {
                if (error instanceof Error) {
                    displayError('Feil ved søk på posisjon: ' + error.message);
                } else {
                    displayError('Feil ved søk på posisjon.');
                }
            });
    }
})

// Event listeners for form submissions
document.getElementById('vegrefForm')?.addEventListener('submit', handleVegrefSearch);
document.getElementById('vegsysrefForm')?.addEventListener('submit', handleVegsysrefSearch);
document.getElementById('posForm')?.addEventListener('submit', handlePosSearch);
document.getElementById('lenkeForm')?.addEventListener('submit', handleLenkesekvensSearch);

// Event listener for historic data toggle
document.getElementById("vis532_switch")?.addEventListener('change', function (this: HTMLInputElement) {
    const historicElements = document.getElementsByClassName("historic_532");
    for (let i = 0; i < historicElements.length; i++) {
        const element = historicElements[i] as HTMLElement;
        element.style.display = this.checked ? "" : "none";
    }
});

// Event listeners for form resets
document.addEventListener('DOMContentLoaded', function () {
    ['vegrefForm', 'posForm', 'lenkeForm', 'vegsysrefForm'].forEach(formId => {
        document.getElementById(formId)?.addEventListener('reset', function (e) {
            e.preventDefault();
            this.querySelectorAll('input').forEach(input => input.value = '');
            this.querySelectorAll('select').forEach(select => select.selectedIndex = 0);

            if (formId === 'vegsysrefForm') {
                const extraType = document.getElementById('extraType') as HTMLSelectElement;
                if (extraType) {
                    extraType.value = '';
                    extraType.dispatchEvent(new Event('change'));
                }
            }
        });
    });
});

// Event listener for extraType selection change
document.addEventListener('DOMContentLoaded', function () {
    const extraType = document.getElementById('extraType') as HTMLSelectElement | null;
    const sideanleggsdelGroup = document.getElementById('sideanleggsdel-group') as HTMLElement | null;
    const kryssdelGroup = document.getElementById('kryssdel-group') as HTMLElement | null;
    const sideanleggsdelInputs = [
        document.getElementById('sideanleggsdel') as HTMLInputElement,
        document.getElementById('sideanleggsdel_meter') as HTMLInputElement
    ];
    const kryssdelInputs = [
        document.getElementById('kryssdel') as HTMLInputElement,
        document.getElementById('kryssdel_meter') as HTMLInputElement
    ];

    function setRequired(inputs: HTMLElement[], required: boolean) {
        inputs.forEach((input: HTMLElement) => {
            if (required) {
                input.setAttribute('required', '');
            } else {
                input.removeAttribute('required');
            }
        });
    }

    extraType?.addEventListener('change', function () {
        const value = (this as HTMLSelectElement).value;
        if (sideanleggsdelGroup && kryssdelGroup) {
            if (value === 'sideanlegg') {
                sideanleggsdelGroup.style.display = '';
                kryssdelGroup.style.display = 'none';
                setRequired(sideanleggsdelInputs, true);
                setRequired(kryssdelInputs, false);
            } else if (value === 'kryssystem') {
                sideanleggsdelGroup.style.display = 'none';
                kryssdelGroup.style.display = '';
                setRequired(sideanleggsdelInputs, false);
                setRequired(kryssdelInputs, true);
            } else {
                sideanleggsdelGroup.style.display = 'none';
                kryssdelGroup.style.display = 'none';
                setRequired(sideanleggsdelInputs, false);
                setRequired(kryssdelInputs, false);
            }
        }
    });
});

    document.getElementById('searchType')?.addEventListener('change', function (e) {
        const vegref = document.getElementById('vegrefSection');
        const vegsysref = document.getElementById('vegsysrefSection');
        const pos = document.getElementById('posSection');
        const koordinat = document.getElementById('lenkeSection');

        if (e && e.target instanceof HTMLSelectElement && vegref && vegsysref && pos && koordinat) {
            if (e.target.value === 'vegref') {
                vegref.style.display = '';
                vegsysref.style.display = 'none';
                pos.style.display = 'none';
                koordinat.style.display = 'none';
            } else if (e.target.value === 'vegsysref') {
                vegref.style.display = 'none';
                vegsysref.style.display = '';
                pos.style.display = 'none';
                koordinat.style.display = 'none';
            } else if (e.target.value === 'koordinat') {
                vegref.style.display = 'none';
                vegsysref.style.display = 'none';
                pos.style.display = '';
                koordinat.style.display = 'none';
            } else if (e.target.value === 'lenke') {
                vegref.style.display = 'none';
                vegsysref.style.display = 'none';
                pos.style.display = 'none';
                koordinat.style.display = '';
            }
        }
    });


// Initialize the map view and tile layer
document.addEventListener('DOMContentLoaded', function () {

    // Fetch kommune numbers and log as a list
    fetch('https://nvdbapiles.atlas.vegvesen.no/omrader/kommuner')
        .then(response => response.json())
        .then(data => {
            // Empty existing options
            const datalist = document.getElementById('vegsysref_kommuner');
            if (datalist) {
                datalist.innerHTML = '';
            }
            // Map data to Kommune objects and create options
            const kommuner: Kommune[] = data.map((k: any) => new Kommune(parseInt(k.nummer), `${k.nummer} - ${k.navn}`));
            kommuner.forEach(k => {
                const option = document.createElement('option');
                option.value = k.id.toString();
                option.textContent = k.label;
                if (datalist) {
                    datalist.appendChild(option);
                }
            });

            gyldigeKommuner = kommuner;
            console.log('Kommune nummer list:', kommuner);
        })
        .catch(error => {
            console.error('Error fetching kommuner:', error);
        });
});

// Handler function for vegreferanse search form submission
async function handleVegrefSearch(event: Event) {
    event.preventDefault();

    const fylke = parseInt((document.getElementById('vegref_fylke') as HTMLInputElement)?.value || '0');
    const kommune = parseInt((document.getElementById('vegref_kommune') as HTMLInputElement)?.value || '0');
    const kat = (document.getElementById('vegref_kat') as HTMLInputElement)?.value || 'E';
    const stat = (document.getElementById('vegref_stat') as HTMLInputElement)?.value || 'V';
    const vegnr = parseInt((document.getElementById('vegref_vegnr') as HTMLInputElement)?.value || '0');
    const hp = parseInt((document.getElementById('vegref_hp') as HTMLInputElement)?.value || '1');
    const meter = parseInt((document.getElementById('vegref_meter') as HTMLInputElement)?.value || '0');
    const tidspunkt = (document.getElementById('vegref_dato') as HTMLInputElement)?.value
        ? new Date((document.getElementById('vegref_dato') as HTMLInputElement).value)
        : undefined;

    try {
        if (fylke && kat && vegnr) {
            showLoading();
            var vegreferanse = Vegreferanse.createFromString(""
                + (fylke ? UtilClass.padNumber(fylke, 2) : '00')
                + (kommune ? UtilClass.padNumber(kommune, 2) : '00')
                + kat
                + stat
                + vegnr
                + "hp" + hp
                + "m" + meter);

            if (((document.getElementById("avansert_vegreg_sok") as HTMLInputElement).checked)) {
                displayResults(await vegrefController.findPosisjonerByVegreferanserAdvanced(vegreferanse, tidspunkt));
            } else {
                displayResults(await vegrefController.findPosisjonerByVegreferanse(vegreferanse, tidspunkt));
            }
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            displayError('Feil ved søk på vegreferanse: ' + error.message);
        } else {
            displayError('Feil ved søk på vegreferanse.');
        }
    }
}

// Handler function for lenkesekvens search form submission
async function handleLenkesekvensSearch(event: Event) {
    event.preventDefault();

    const linkid = parseFloat((document.getElementById('lenkesekvensId') as HTMLInputElement).value || '0');
    const position = parseFloat((document.getElementById('posisjon') as HTMLInputElement).value);
    const tidspunkt = (document.getElementById('lenkeForm_dato') as HTMLInputElement)?.value
        ? new Date((document.getElementById('lenkeForm_dato') as HTMLInputElement).value)
        : undefined;

    if (linkid && position) {
        try {
            showLoading();
            displayResults(await vegrefController.findPosisjonerByLenkesekvens(linkid, position, tidspunkt));
        } catch (error: unknown) {
            if (error instanceof Error) {
                displayError('Feil ved søk på posisjon: ' + error.message);
            } else {
                displayError('Feil ved søk på posisjon.');
            }
        }
    }
}

// Handler function for vegsystemreferanse search form submission
async function handleVegsysrefSearch(event: Event) {
    event.preventDefault();

    const kommune = parseInt((document.getElementById('vegsysref_kommune') as HTMLInputElement)?.value) || undefined;
    const kat = (document.getElementById('vegsysref_kat') as HTMLInputElement)?.value || 'E';
    const stat = (document.getElementById('vegsysref_fase') as HTMLInputElement)?.value || 'V';
    const vegnr = parseInt((document.getElementById('vegsysref_vegnr') as HTMLInputElement)?.value || '0');
    const strekning = parseInt((document.getElementById('vegsysref_strekning') as HTMLInputElement)?.value || '1');
    const delstrekning = parseInt((document.getElementById('vegsysref_delstrekning') as HTMLInputElement)?.value || '1');
    const meter = parseInt((document.getElementById('vegsysref_meter') as HTMLInputElement)?.value || '0');
    const tidspunkt = (document.getElementById('vegsysref_dato') as HTMLInputElement)?.value
        ? new Date((document.getElementById('vegsysref_dato') as HTMLInputElement).value)
        : undefined;

    if (kommune && !gyldigeKommuner.some(k => k.id === kommune)) {
        displayError('Ugyldig kommune.  Velg en fra listen.');
        return;
    }

    try {
        showLoading();
        var vegsystemreferanse = ""
            + (kommune ? UtilClass.padNumber(kommune, 4) : "")
            + kat
            + stat
            + vegnr
            + "s"
            + strekning.toString()
            + "d"
            + delstrekning.toString()
            + "m"
            + meter.toString();


        // Ekstra type
        const extraType = (document.getElementById('extraType') as HTMLSelectElement)?.value;

        // Sideanlegg
        const sideanleggsdel = parseInt((document.getElementById('sideanleggsdel') as HTMLInputElement)?.value || '0');
        const sideanleggsdel_meter = parseInt((document.getElementById('sideanleggsdel_meter') as HTMLInputElement)?.value || '0');

        // Kryssdel
        const kryssdel = parseInt((document.getElementById('kryssdel') as HTMLInputElement)?.value || '0');
        const kryssdel_meter = parseInt((document.getElementById('kryssdel_meter') as HTMLInputElement)?.value || '0');

        if (extraType !== "Ingen") {
            if (extraType == "sideanlegg" && sideanleggsdel > 0) {
                vegsystemreferanse += "sd" + sideanleggsdel.toString() + "m" + sideanleggsdel_meter.toString();
            } else if (kryssdel > 0) {
                vegsystemreferanse += "kd" + kryssdel.toString() + "m" + kryssdel_meter.toString();
            }
        }

        displayResults(await vegrefController.findPosisjonerByVegsystemreferanse(vegsystemreferanse, tidspunkt));
    } catch (error: unknown) {
        if (error instanceof Error) {
            displayError('Feil ved søk på vegsystemreferanse: ' + error.message);
        } else {
            displayError('Feil ved søk på vegsystemreferanse.');
        }
    }
}

// Handler function for position search form submission
async function handlePosSearch(event: Event) {
    event.preventDefault();

    const easting = parseFloat((document.getElementById('easting') as HTMLInputElement)?.value || '0');
    const northing = parseFloat((document.getElementById('northing') as HTMLInputElement)?.value || '0');
    const tidspunkt = (document.getElementById('posForm_dato') as HTMLInputElement)?.value
        ? new Date((document.getElementById('posForm_dato') as HTMLInputElement).value)
        : undefined;


    if (easting && northing) {
        try {
            showLoading();
            displayResults(await vegrefController.findPosisjonerByCoordinates(northing, easting, tidspunkt));
        } catch (error: unknown) {
            if (error instanceof Error) {
                displayError('Feil ved søk på posisjon: ' + error.message);
            } else {
                displayError('Feil ved søk på posisjon.');
            }
        }
    }
}

// Function to clear existing markers from the map
function clearMarkers() {
    markers.forEach(marker => marker.remove());
    markers.length = 0;
}

// Function to show loading message
function showLoading() {
    const elementById = document.getElementById('results');
    if (elementById) elementById.innerHTML = '<p>Søker...</p>';
}


// Function to display results in the results div and add markers to the map
async function displayResults(result: VegrefAndVegsystemreferanse[]) {
    const resultsDiv = (document.getElementById('results') as HTMLDivElement);

    clearMarkers();

    if (result.length == 0) {
        if (resultsDiv) resultsDiv.innerHTML = '<p>Ingen historiske vegreferanser funnet.</p>';
    } else {
        let html = '<h3>Resultater:</h3>' +
            '<table class="results-table" border="1">' +
            '<thead>' +
            '<tr>' +
            '<th>Vegreferanse</th>' +
            '<th class="historic_532" style="display:none">Vegreferanse <br>(Objekttype 532)</th>' +
            '<th class="historic_532" style="display:none">Veglenkeposisjon <br>( 532 )</th>' +
            '<th>Fa dato</th>' +
            '<th>Til dato</th>' +
            '<th>Veglenkeposisjon</th>' +
            '<th>Koordinat</th>' +
            '<th>Dagens vegsystemreferanse</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody>';

        let lastVeglenkeid: number = -1;
        let rowClass = '';

        result
            .slice()
            .sort((a, b) => {
                if (a.veglenkeid !== b.veglenkeid) {
                    return a.veglenkeid - b.veglenkeid;
                }
                const dateA = new Date(a.fraDato).getTime();
                const dateB = new Date(b.fraDato).getTime();
                return dateA - dateB;
            })
            .forEach(feature => {
                if (feature.veglenkeid !== lastVeglenkeid) {
                    lastVeglenkeid = feature.veglenkeid;
                    rowClass = rowClass === 'grey1' ? 'grey2' : 'grey1';
                }

                var latlng = {lat: 0, lng: 0};
                if (feature.koordinat === 'undefined' || !feature.koordinat) {
                    latlng = {lat: 0, lng: 0};
                    feature.koordinat = "Ukjent koordinat";
                } else {
                    const geom = WKT.parse(feature.koordinat);
                    if (geom.type === 'Point') {
                        const [x, y] = geom.coordinates;
                        latlng = convertUTM33ToWGS84LatLong(x as number, y as number);
                        // Check if a marker already exists at this position
                        const existingMarker = markers.find(m => {
                            const pos = m.getLatLng();
                            return pos.lat === latlng.lat && pos.lng === latlng.lng;
                        });
                        if (existingMarker) {
                            // Append to existing popup content
                            const currentContent = existingMarker.getPopup()?.getContent() || '';
                            existingMarker.bindPopup(
                                currentContent +
                                `<br>${feature.fraDato},  ${feature.beregnetVegreferanse}`
                            ).openPopup();
                        } else {
                            const marker = L.marker([latlng.lat, latlng.lng]).addTo(map);
                            marker.bindPopup(feature.fraDato + ",  " + feature.beregnetVegreferanse).openPopup();
                            markers.push(marker);
                        }
                    }
                }


                html += `<tr class="${rowClass}">
            <td>
                ${latlng.lat !== 0
                    ? `<a href="#" onclick="window.leafletMap.setView([${latlng.lat}, ${latlng.lng}], 16); return false;">${feature.beregnetVegreferanse}</a>`
                    : `${feature.beregnetVegreferanse}`}
            </td>
            <td class="historic_532" style="display:none">${feature.vegreferanse}</td>
            <td class="historic_532" style="display:none">${feature.veglenkeposisjon}</td>
            <td>${feature.fraDato}</td>
            <td>${feature.tilDato}</td>
            <td>${UtilClass.formatNumber(feature.relativPosisjon, 6)}@${feature.veglenkeid}</td>
            <td>${feature.koordinat}</td>
            <td>${feature.vegsystemreferanse}</td>
            </tr>`;
            });
        html += '</tbody></table>';
        resultsDiv.innerHTML = html;
    }
}

// Function to convert UTM33 coordinates to WGS84 latitude and longitude
function convertUTM33ToWGS84LatLong(x: number, y: number): { lat: number, lng: number } {
    let transformed = proj4(UTM33, WGS84, [x, y]);
    return {
        'lat': transformed[1] || 0,
        'lng': transformed[0] || 0
    };
}

// Function to display error messages
function displayError(message: string) {
    (document.getElementById('results') as HTMLElement).innerHTML = `<p style="color: red;">${message}</p>`;
}
