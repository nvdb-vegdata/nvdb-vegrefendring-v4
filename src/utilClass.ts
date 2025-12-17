import type {HistoricVegobjekt, Posisjon, Vegsystemreferanse} from "./nvdbTypes.ts";
import {Vegkategori, Vegstatus} from "./vegreferanse.js";

// Enum for property IDs used in Vegobjekt
enum Egenskap {
    VEGKATEGORI = 4566,
    VEGSTATUS = 4567,
    VEGNUMMER = 4568,
    PARSELL = 4569,
    START_METER = 4571,
    SLUTT_METER = 4572,
    FYLKE = 4591,
    KOMMUNE = 4592,
}

export class UtilClass {

    /**
     * Converts a `Vegobjekt` to a formatted vegreferanse string.
     * Extracts properties such as vegkategori, vegstatus, vegnummer, parsell, fylke, kommune, and meter values.
     * Returns a string representation combining these values.
     *
     * @param vegobjekt The `Vegobjekt` to convert.
     * @returns A formatted vegreferanse string.
     */
    static toVegreferanse(vegobjekt: HistoricVegobjekt): String {
        const vegkategori = vegobjekt.egenskaper.find(e => e.id === Egenskap.VEGKATEGORI);
        const vegstatus = vegobjekt.egenskaper.find(e => e.id === Egenskap.VEGSTATUS);
        const vegnummer = vegobjekt.egenskaper.find(e => e.id === Egenskap.VEGNUMMER);
        const parsell = vegobjekt.egenskaper.find(e => e.id === Egenskap.PARSELL);
        const fylke = vegobjekt.egenskaper.find(e => e.id === Egenskap.FYLKE);
        const kommune = vegobjekt.egenskaper.find(e => e.id === Egenskap.KOMMUNE);
        const meterStart = vegobjekt.egenskaper.find(e => e.id === Egenskap.START_METER);
        const meterEnd = vegobjekt.egenskaper.find(e => e.id === Egenskap.SLUTT_METER);


        return ""
            + fylke?.verdi?.toString().padStart(2, "0")
            + kommune?.verdi?.toString().padStart(2, "0")
            + (vegkategori?.enum_id === undefined ? "" : Vegkategori[vegkategori.enum_id])
            + (vegstatus?.enum_id === undefined ? "" : Vegstatus[vegstatus.enum_id])
            + vegnummer?.verdi
            + " hp" + parsell?.verdi + " m" + meterStart?.verdi + " - " + meterEnd?.verdi;
    }


    /**
     * Converts a `Vegobjekt` to a formatted vegreferanse string.
     * Extracts properties such as vegkategori, vegstatus, vegnummer, parsell, fylke, kommune, and meter values.
     * Returns a string representation combining these values.
     *
     * @param vegobjekt The `Vegobjekt` to convert.
     * @param meter
     * @returns A formatted vegreferanse string.
     */
    static toVegreferanseWithMeter(vegobjekt: HistoricVegobjekt, meter: number): String {
        const vegkategori = vegobjekt.egenskaper.find(e => e.id === Egenskap.VEGKATEGORI);
        const vegstatus = vegobjekt.egenskaper.find(e => e.id === Egenskap.VEGSTATUS);
        const vegnummer = vegobjekt.egenskaper.find(e => e.id === Egenskap.VEGNUMMER);
        const parsell = vegobjekt.egenskaper.find(e => e.id === Egenskap.PARSELL);
        const fylke = vegobjekt.egenskaper.find(e => e.id === Egenskap.FYLKE);
        const kommune = vegobjekt.egenskaper.find(e => e.id === Egenskap.KOMMUNE);


        return ""
            + fylke?.verdi?.toString().padStart(2, "0")
            + kommune?.verdi?.toString().padStart(2, "0")
            + " "
            + (vegkategori?.enum_id === undefined ? "" : Vegkategori[vegkategori.enum_id])
            + (vegstatus?.enum_id === undefined ? "" : Vegstatus[vegstatus.enum_id])
            + vegnummer?.verdi
            + " hp" + parsell?.verdi + " m" + meter;
    }


    /**
     * Beregner relativ posisjon for et `Vegobjekt` basert på en gitt meterverdi.
     * Finner start- og sluttmeter-egenskapene (id 4571 og 4572) og bruker første stedfesting.
     * Returnerer `undefined` hvis nødvendig data mangler, ellers returneres relativ posisjon og lokasjon.
     *
     * @param vegobjekt Vegobjektet det skal beregnes posisjon for.
     * @param currentMeter Meterverdien det skal beregnes relativ posisjon for.
     * @returns Et objekt med `position` og `lokasjon`, eller `undefined` hvis data mangler.
     */
    static finnRelativPosisjon(vegobjekt: HistoricVegobjekt, currentMeter: number, ignoreRetning: boolean) {

        const fra = vegobjekt.egenskaper.find(e => e.id === Egenskap.START_METER);
        const til = vegobjekt.egenskaper.find(e => e.id === Egenskap.SLUTT_METER);
        const stedfesting = vegobjekt.lokasjon.stedfestinger[0];

        if (!stedfesting || !fra || !til) {
            return undefined;
        } else {
            const position = UtilClass.calculateCustomRelativePosition(
                typeof fra.verdi === "number" ? fra.verdi : 0,
                typeof til.verdi === "number" ? til.verdi : 0,
                stedfesting.startposisjon,
                stedfesting.sluttposisjon,
                currentMeter);


            if (vegobjekt.lokasjon.stedfestinger.length > 0) {
                const stedfesting = vegobjekt.lokasjon.stedfestinger[0];
                if (!ignoreRetning && stedfesting?.retning === "MOT") {
                    // Juster posisjonen for retning MOT
                    const justertPosition = stedfesting?.sluttposisjon - position;
                    return {position: justertPosition, lokasjon: stedfesting};
                }
            }

            return {position, lokasjon: stedfesting};
        }
    }

    /**
     * Beregner meterverdien basert på en gitt relativ posisjon i et `Vegobjekt`.
     * Finner start- og sluttmeter-egenskapene (id 4571 og 4572) og bruker første stedfesting.
     * Returnerer 0 hvis nødvendig data mangler, ellers returneres den beregnede meterverdien.
     *
     * @param vegobjekt Vegobjektet det skal beregnes meterverdi for.
     * @param relativePosition Den relative posisjonen som skal konverteres til meterverdi.
     * @param ignorerRetning Valgfritt flagg for å ignorere retningen ved beregning (standard er false).
     * @returns Den beregnede meterverdien.
     */
    static finnRelativMeter(vegobjekt: HistoricVegobjekt, relativePosition: number, ignorerRetning: boolean = false) {
        const fra = vegobjekt.egenskaper.find(e => e.id === Egenskap.START_METER);
        const til = vegobjekt.egenskaper.find(e => e.id === Egenskap.SLUTT_METER);
        const stedfesting = vegobjekt.lokasjon.stedfestinger[0];

        if (!stedfesting || !fra || !til) {
            return 0;
        } else {
            const startMeter = typeof fra.verdi === "number" ? fra.verdi : 0;
            const endMeter = typeof til.verdi === "number" ? til.verdi : 0;

            if (!ignorerRetning && stedfesting.retning === "MOT") {
                // Juster den relative posisjonen for retning MOT
                relativePosition = stedfesting.sluttposisjon - (relativePosition - stedfesting.startposisjon);
            }

            // Formel for å konvertere relativ posisjon tilbake til meterverdi
            const meterValue = startMeter + (relativePosition - stedfesting.startposisjon) * (endMeter - startMeter) / (stedfesting.sluttposisjon - stedfesting.startposisjon);

            return Number(meterValue.toFixed(0));
        }
    }


    /**
     * Beregner den nye relative posisjonen basert på meterverdier og egendefinerte relative grenser.
     *
     * @param startMeter Startpunktet for det absolutte meterområdet.
     * @param endMeter Sluttpunktet for det absolutte meterområdet.
     * @param relativeStart Den egendefinerte relative startposisjonen (0-1).
     * @param relativeEnd Den egendefinerte relative sluttposisjonen (0-1).
     * @param currentMeter Den aktuelle meterverdien som skal konverteres.
     * @returns Den nye relative posisjonen innenfor det egendefinerte området.
     */
    static calculateCustomRelativePosition(
        startMeter: number,
        endMeter: number,
        relativeStart: number,
        relativeEnd: number,
        currentMeter: number
    ): number {

        // Sjekk for å unngå deling på null hvis startMeter og endMeter er like
        if (startMeter === endMeter) {
            return relativeStart;
        }

        // Formel for omskalering av currentMeter til det nye relative området
        const customPosition = Math.abs(relativeStart + (currentMeter - startMeter) * (relativeEnd - relativeStart) / (endMeter - startMeter));

        if (customPosition < relativeStart) return relativeStart;
        if (customPosition > relativeEnd) return relativeEnd;

        return customPosition;
    }

    /**
     * Pads a number with leading zeros to reach a specified maximum length.
     * @param number
     * @param maxlength
     */
    static padNumber(number: number, maxlength: number) {
        return number.toString().padStart(maxlength, '0');
    }


    /**
     * Formats a number to a string with a specified number of decimal places.
     * Trailing zeros and decimal points are removed as needed.
     * If the number is zero, returns "0.0".
     * @param num
     * @param decimals
     */
    static formatNumber(num: number, decimals: number = 8) {
        if (num === 0) return "0.0";

        // Round to specified decimals
        let str = num.toFixed(decimals)
            .replace(/0+$/, "")   // remove trailing zeros
            .replace(/\.$/, "");  // remove trailing dot if any

        // If no decimal point remains, add ".0"
        if (!str.includes(".")) str += ".0";

        return str;
    }


    /**
     * Returns a formatted vegsystem reference string with municipality info if applicable.
     * If the vegsystem category is "E", "R", or "F", only the short form is returned.
     * Otherwise, the municipality and short form are combined.
     * @param posisjon The position object containing vegsystemreferanse and kommune.
     * @returns A formatted string for the vegsystem reference.
     */
    static getVegsysrefWithKommune(posisjon: Posisjon): string {
        if (!posisjon.vegsystemreferanse) {
            return "Ukjent vegsystemreferanse";
        }
        switch (posisjon.vegsystemreferanse.vegsystem.vegkategori) {
            case "E":
            case "R":
            case "F":
                return "" + posisjon.vegsystemreferanse.kortform;
            default:
                return "" + posisjon.kommune + " " + posisjon.vegsystemreferanse.kortform;
        }
    }
}