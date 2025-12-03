export declare class Vegreferanse {
    vegkategori: Vegkategori;
    vegstatus: Vegstatus;
    vegnummer: number;
    fylke: number;
    kommune: number;
    meter: number;
    parsell: number;
    static createFromString(vegreferanse: String): Vegreferanse;
    private constructor();
}
export declare enum Vegkategori {
    E = 5492,/* Europaveg */
    R = 5493,/* Riksveg */
    F = 5494,/* Fylkesveg */
    K = 5495,/* Kommunal veg */
    P = 5496,/* Privat veg */
    S = 5497
}
export declare enum Vegstatus {
    V = 5499,/* Eksisterende veg */
    W = 5505,/* Midlertidig veg */
    T = 5502,/* Midlertidig status bilveg */
    S = 5504,/* Eksisternde ferjestrekning */
    G = 12159,/* Gang-/sykkelveg */
    U = 12983,/* Midlertidig status gang-/sykkelveg */
    B = 13707,/* Beredskapsveg */
    M = 5501,/* Serviceveg */
    X = 5500,/* Rømmingstunnel */
    A = 7041,/* Anleggsveg */
    H = 12160,/* Gang-/sykkelveg anlegg */
    P = 7042,/* Planlagt veg */
    E = 7046,/* Planlagt ferjestrekning */
    Q = 12986
}
//# sourceMappingURL=vegreferanse.d.ts.map