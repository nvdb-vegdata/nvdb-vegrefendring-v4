import {Vegreferanse} from "./vegreferanse.js";
import type {VegrefAndVegsystemreferanse} from "./nvdbTypes.js";
import {VegrefController} from "./vegrefController.js";
import {UtilClass} from "./utilClass.js";
// import * as Terraformer from 'terraformer';
// import * as L from 'leaflet';
// import proj4 from 'proj4';
// import 'terraformer-wkt-parser';

// Define UTM33 and WGS84 projections
const UTM33 = '+proj=utm +zone=33 +ellps=GRS80 +units=m +no_defs';
const WGS84 = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';


// Instantiate the controller
var vegrefController = new VegrefController();

// Initialize the map
const map = L.map('map');
(window as any).map = map;
const markers: L.Marker[] = [];

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
['vegrefForm', 'posForm', 'lenkeForm', 'vegsysrefForm'].forEach(formId => {
    document.getElementById(formId)?.addEventListener('reset', function (e) {
        e.preventDefault();
        this.querySelectorAll('input').forEach(input => input.value = '');
        this.querySelectorAll('select').forEach(select => select.selectedIndex = 0);
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

// Initialize the map view and tile layer
document.addEventListener('DOMContentLoaded', function () {
    map.setView([60.472, 8.4689], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '© OpenStreetMap contributors'}).addTo(map);
});

// Event listener for toggling search sections
document.addEventListener('DOMContentLoaded', function () {
    const toggleBtn = document.getElementById('toggleSearchSections');
    const searchSections = document.querySelector('.search-sections');
    let minimized = false;
    toggleBtn?.addEventListener('click', function () {
        minimized = !minimized;
        Array.from(searchSections?.children ?? []).forEach(child => {
            if (child !== toggleBtn) {
                (child as HTMLElement).style.display = minimized ? 'none' : '';
            }
        });
        toggleBtn.innerHTML = minimized ? '<span id="toggleIcon" style="font-size:1.2em;">▼</span>' : '<span id="toggleIcon" style="font-size:1.2em;">▲</span>';
    });
});


// Event listener for toggling map visibility
document.addEventListener('DOMContentLoaded', function () {
    const toggleBtn = document.getElementById('toggleMapBtn');
    const mapDiv = document.getElementById('map');
    if (!toggleBtn || !mapDiv) return;
    toggleBtn.addEventListener('click', () => {
        if (mapDiv.style.display === 'none') {
            mapDiv.style.display = '';
            toggleBtn.textContent = 'Skjul kart';
        } else {
            mapDiv.style.display = 'none';
            toggleBtn.textContent = 'Vis kart';
        }
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

    const fylke = parseInt((document.getElementById('vegsysref_fylke') as HTMLInputElement)?.value) || undefined;
    const kommune = parseInt((document.getElementById('vegsysref_kommune') as HTMLInputElement)?.value) || undefined;
    const kat = (document.getElementById('vegsysref_kat') as HTMLInputElement)?.value || 'E';
    const stat = (document.getElementById('vegsysref_stat') as HTMLInputElement)?.value || 'V';
    const vegnr = parseInt((document.getElementById('vegsysref_vegnr') as HTMLInputElement)?.value || '0');
    const strekning = parseInt((document.getElementById('vegsysref_strekning') as HTMLInputElement)?.value || '1');
    const delstrekning = parseInt((document.getElementById('vegsysref_delstrekning') as HTMLInputElement)?.value || '1');
    const meter = parseInt((document.getElementById('vegsysref_meter') as HTMLInputElement)?.value || '0');
    const tidspunkt = (document.getElementById('vegsysref_dato') as HTMLInputElement)?.value
        ? new Date((document.getElementById('vegsysref_dato') as HTMLInputElement).value)
        : undefined;


    showLoading();
    var vegsystemreferanse = ""
        + (fylke ? UtilClass.padNumber(fylke, 2) : "")
        + (kommune ? UtilClass.padNumber(kommune, 2) : "")
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
        showLoading();
        displayResults(await vegrefController.findPosisjonerByCoordinates(northing, easting, tidspunkt));
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
        if (resultsDiv) resultsDiv.innerHTML = '<p>Ingen resultater funnet.</p>';
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
                } else {
                    const geom = Terraformer.WKT.parse(feature.koordinat);
                    if (geom.type === 'Point') {
                        const [x, y] = geom.coordinates;
                        latlng = convertUTM33ToWGS84LatLong(x, y);
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
                    ? `<a href="#" onclick="map.setView([${latlng.lat}, ${latlng.lng}], 16); return false;">${feature.beregnetVegreferanse}</a>`
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
