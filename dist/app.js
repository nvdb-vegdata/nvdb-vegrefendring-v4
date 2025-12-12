import { Vegreferanse } from "./vegreferanse.js";
import { VegrefController } from "./vegrefController.js";
import { UtilClass } from "./utilClass.js";
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
window.map = map;
const markers = [];
// Event listeners for form submissions
document.getElementById('vegrefForm')?.addEventListener('submit', handleVegrefSearch);
document.getElementById('vegsysrefForm')?.addEventListener('submit', handleVegsysrefSearch);
document.getElementById('posForm')?.addEventListener('submit', handlePosSearch);
document.getElementById('lenkeForm')?.addEventListener('submit', handleLenkesekvensSearch);
// Event listener for historic data toggle
document.getElementById("vis532_switch")?.addEventListener('change', function () {
    const historicElements = document.getElementsByClassName("historic_532");
    for (let i = 0; i < historicElements.length; i++) {
        const element = historicElements[i];
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
    const extraType = document.getElementById('extraType');
    const sideanleggsdelGroup = document.getElementById('sideanleggsdel-group');
    const kryssdelGroup = document.getElementById('kryssdel-group');
    const sideanleggsdelInputs = [
        document.getElementById('sideanleggsdel'),
        document.getElementById('sideanleggsdel_meter')
    ];
    const kryssdelInputs = [
        document.getElementById('kryssdel'),
        document.getElementById('kryssdel_meter')
    ];
    function setRequired(inputs, required) {
        inputs.forEach((input) => {
            if (required) {
                input.setAttribute('required', '');
            }
            else {
                input.removeAttribute('required');
            }
        });
    }
    extraType?.addEventListener('change', function () {
        const value = this.value;
        if (sideanleggsdelGroup && kryssdelGroup) {
            if (value === 'sideanlegg') {
                sideanleggsdelGroup.style.display = '';
                kryssdelGroup.style.display = 'none';
                setRequired(sideanleggsdelInputs, true);
                setRequired(kryssdelInputs, false);
            }
            else if (value === 'kryssystem') {
                sideanleggsdelGroup.style.display = 'none';
                kryssdelGroup.style.display = '';
                setRequired(sideanleggsdelInputs, false);
                setRequired(kryssdelInputs, true);
            }
            else {
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
        }
        else if (e.target.value === 'vegsysref') {
            vegref.style.display = 'none';
            vegsysref.style.display = '';
            pos.style.display = 'none';
            koordinat.style.display = 'none';
        }
        else if (e.target.value === 'koordinat') {
            vegref.style.display = 'none';
            vegsysref.style.display = 'none';
            pos.style.display = '';
            koordinat.style.display = 'none';
        }
        else if (e.target.value === 'lenke') {
            vegref.style.display = 'none';
            vegsysref.style.display = 'none';
            pos.style.display = 'none';
            koordinat.style.display = '';
        }
    }
});
// Initialize the map view and tile layer
document.addEventListener('DOMContentLoaded', function () {
    map.setView([60.472, 8.4689], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(map);
});
// Handler function for vegreferanse search form submission
async function handleVegrefSearch(event) {
    event.preventDefault();
    const fylke = parseInt(document.getElementById('vegref_fylke')?.value || '0');
    const kommune = parseInt(document.getElementById('vegref_kommune')?.value || '0');
    const kat = document.getElementById('vegref_kat')?.value || 'E';
    const stat = document.getElementById('vegref_stat')?.value || 'V';
    const vegnr = parseInt(document.getElementById('vegref_vegnr')?.value || '0');
    const hp = parseInt(document.getElementById('vegref_hp')?.value || '1');
    const meter = parseInt(document.getElementById('vegref_meter')?.value || '0');
    const tidspunkt = document.getElementById('vegref_dato')?.value
        ? new Date(document.getElementById('vegref_dato').value)
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
        if ((document.getElementById("avansert_vegreg_sok").checked)) {
            displayResults(await vegrefController.findPosisjonerByVegreferanserAdvanced(vegreferanse, tidspunkt));
        }
        else {
            displayResults(await vegrefController.findPosisjonerByVegreferanse(vegreferanse, tidspunkt));
        }
    }
}
// Handler function for lenkesekvens search form submission
async function handleLenkesekvensSearch(event) {
    event.preventDefault();
    const linkid = parseFloat(document.getElementById('lenkesekvensId').value || '0');
    const position = parseFloat(document.getElementById('posisjon').value);
    const tidspunkt = document.getElementById('lenkeForm_dato')?.value
        ? new Date(document.getElementById('lenkeForm_dato').value)
        : undefined;
    if (linkid && position) {
        try {
            showLoading();
            displayResults(await vegrefController.findPosisjonerByLenkesekvens(linkid, position, tidspunkt));
        }
        catch (error) {
            if (error instanceof Error) {
                displayError('Feil ved søk på posisjon: ' + error.message);
            }
            else {
                displayError('Feil ved søk på posisjon.');
            }
        }
    }
}
// Handler function for vegsystemreferanse search form submission
async function handleVegsysrefSearch(event) {
    event.preventDefault();
    const fylke = parseInt(document.getElementById('vegsysref_fylke')?.value) || undefined;
    const kommune = parseInt(document.getElementById('vegsysref_kommune')?.value) || undefined;
    const kat = document.getElementById('vegsysref_kat')?.value || 'E';
    const stat = document.getElementById('vegsysref_fase')?.value || 'V';
    const vegnr = parseInt(document.getElementById('vegsysref_vegnr')?.value || '0');
    const strekning = parseInt(document.getElementById('vegsysref_strekning')?.value || '1');
    const delstrekning = parseInt(document.getElementById('vegsysref_delstrekning')?.value || '1');
    const meter = parseInt(document.getElementById('vegsysref_meter')?.value || '0');
    const tidspunkt = document.getElementById('vegsysref_dato')?.value
        ? new Date(document.getElementById('vegsysref_dato').value)
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
    const extraType = document.getElementById('extraType')?.value;
    // Sideanlegg
    const sideanleggsdel = parseInt(document.getElementById('sideanleggsdel')?.value || '0');
    const sideanleggsdel_meter = parseInt(document.getElementById('sideanleggsdel_meter')?.value || '0');
    // Kryssdel
    const kryssdel = parseInt(document.getElementById('kryssdel')?.value || '0');
    const kryssdel_meter = parseInt(document.getElementById('kryssdel_meter')?.value || '0');
    if (extraType !== "Ingen") {
        if (extraType == "sideanlegg" && sideanleggsdel > 0) {
            vegsystemreferanse += "sd" + sideanleggsdel.toString() + "m" + sideanleggsdel_meter.toString();
        }
        else if (kryssdel > 0) {
            vegsystemreferanse += "kd" + kryssdel.toString() + "m" + kryssdel_meter.toString();
        }
    }
    displayResults(await vegrefController.findPosisjonerByVegsystemreferanse(vegsystemreferanse, tidspunkt));
}
// Handler function for position search form submission
async function handlePosSearch(event) {
    event.preventDefault();
    const easting = parseFloat(document.getElementById('easting')?.value || '0');
    const northing = parseFloat(document.getElementById('northing')?.value || '0');
    const tidspunkt = document.getElementById('posForm_dato')?.value
        ? new Date(document.getElementById('posForm_dato').value)
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
    if (elementById)
        elementById.innerHTML = '<p>Søker...</p>';
}
// Function to display results in the results div and add markers to the map
async function displayResults(result) {
    const resultsDiv = document.getElementById('results');
    clearMarkers();
    if (result.length == 0) {
        if (resultsDiv)
            resultsDiv.innerHTML = '<p>Ingen resultater funnet.</p>';
    }
    else {
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
        let lastVeglenkeid = -1;
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
            var latlng = { lat: 0, lng: 0 };
            if (feature.koordinat === 'undefined' || !feature.koordinat) {
                latlng = { lat: 0, lng: 0 };
            }
            else {
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
                        existingMarker.bindPopup(currentContent +
                            `<br>${feature.fraDato},  ${feature.beregnetVegreferanse}`).openPopup();
                    }
                    else {
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
function convertUTM33ToWGS84LatLong(x, y) {
    let transformed = proj4(UTM33, WGS84, [x, y]);
    return {
        'lat': transformed[1] || 0,
        'lng': transformed[0] || 0
    };
}
// Function to display error messages
function displayError(message) {
    document.getElementById('results').innerHTML = `<p style="color: red;">${message}</p>`;
}
//# sourceMappingURL=app.js.map