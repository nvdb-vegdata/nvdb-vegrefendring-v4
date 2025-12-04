import type { HistoricVegobjekt, Posisjon } from "./nvdbTypes.ts";
export declare class UtilClass {
    /**
     * Converts a `Vegobjekt` to a formatted vegreferanse string.
     * Extracts properties such as vegkategori, vegstatus, vegnummer, parsell, fylke, kommune, and meter values.
     * Returns a string representation combining these values.
     *
     * @param vegobjekt The `Vegobjekt` to convert.
     * @returns A formatted vegreferanse string.
     */
    static toVegreferanse(vegobjekt: HistoricVegobjekt): String;
    /**
     * Converts a `Vegobjekt` to a formatted vegreferanse string.
     * Extracts properties such as vegkategori, vegstatus, vegnummer, parsell, fylke, kommune, and meter values.
     * Returns a string representation combining these values.
     *
     * @param vegobjekt The `Vegobjekt` to convert.
     * @param meter
     * @returns A formatted vegreferanse string.
     */
    static toVegreferanseWithMeter(vegobjekt: HistoricVegobjekt, meter: number): String;
    /**
     * Beregner relativ posisjon for et `Vegobjekt` basert på en gitt meterverdi.
     * Finner start- og sluttmeter-egenskapene (id 4571 og 4572) og bruker første stedfesting.
     * Returnerer `undefined` hvis nødvendig data mangler, ellers returneres relativ posisjon og lokasjon.
     *
     * @param vegobjekt Vegobjektet det skal beregnes posisjon for.
     * @param currentMeter Meterverdien det skal beregnes relativ posisjon for.
     * @returns Et objekt med `position` og `lokasjon`, eller `undefined` hvis data mangler.
     */
    static finnRelativPosisjon(vegobjekt: HistoricVegobjekt, currentMeter: number, ignoreRetning: boolean): {
        position: number;
        lokasjon: import("./nvdbTypes.ts").Stedfesting;
    } | undefined;
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
    static finnRelativMeter(vegobjekt: HistoricVegobjekt, relativePosition: number, ignorerRetning?: boolean): number;
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
    static calculateCustomRelativePosition(startMeter: number, endMeter: number, relativeStart: number, relativeEnd: number, currentMeter: number): number;
    /**
     * Pads a number with leading zeros to reach a specified maximum length.
     * @param number
     * @param maxlength
     */
    static padNumber(number: number, maxlength: number): string;
    /**
     * Formats a number to a string with a specified number of decimal places.
     * Trailing zeros and decimal points are removed as needed.
     * If the number is zero, returns "0.0".
     * @param num
     * @param decimals
     */
    static formatNumber(num: number, decimals?: number): string;
    static getVegsysrefWithKommune(posisjon: Posisjon): string;
}
//# sourceMappingURL=utilClass.d.ts.map