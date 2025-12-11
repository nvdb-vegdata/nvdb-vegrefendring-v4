import type { Vegreferanse } from "./vegreferanse.js";
import type { VegrefAndVegsystemreferanse } from "./nvdbTypes.js";
/**
 * Controller for handling operations related to Vegreferanse and Vegsystemreferanse.
 */
export declare class VegrefController {
    /**
     * Finds positions by a given Vegreferanse in a simplified way.
     * Returns an array of objects with vegreferanse, dates, position info, coordinates, and system reference.
     * @param vegreferanse - The Vegreferanse object to search for.
     * @param tidspunkt - Optional timestamp for historic lookup.
     * @returns Promise resolving to an array of position and reference objects.
     */
    findPosisjonerByVegreferanse(vegreferanse: Vegreferanse, tidspunkt?: Date): Promise<VegrefAndVegsystemreferanse[]>;
    /**
     * Finds positions by a given Vegreferanse and optional timestamp.
     * Returns an array of objects containing vegreferanse, dates, position info, coordinates, and system reference.
     * @param vegreferanse - The Vegreferanse object to search for.
     * @param tidspunkt - Optional timestamp for historic lookup.
     * @returns Promise resolving to an array of position and reference objects.
     */
    findPosisjonerByVegreferanserAdvanced(vegreferanse: Vegreferanse, tidspunkt?: Date): Promise<VegrefAndVegsystemreferanse[]>;
    /**
     * Finds positions by a given road system reference (`vegsystemreferanse`) and optional timestamp.
     * Returns an array of objects containing road reference, dates, position info, coordinates, and system reference.
     * @param vegsystemreferanse - The road system reference to search for.
     * @param tidspunkt - Optional date for historical lookup.
     * @returns Promise resolving to an array of position and reference objects.
     */
    findPosisjonerByVegsystemreferanse(vegsystemreferanse: String, tidspunkt?: Date): Promise<VegrefAndVegsystemreferanse[]>;
    /**
     * Finds positions by a given link sequence ID (`linkid`) and position, with optional timestamp.
     * Returns an array of objects containing road reference, dates, position info, coordinates, and system reference.
     * @param linkid - The link sequence ID to search for.
     * @param position - The position along the link sequence.
     * @param tidspunkt - Optional timestamp for historical lookup.
     * @returns Promise resolving to an array of position and reference objects.
     */
    findPosisjonerByLenkesekvens(linkid: number, position: number, tidspunkt?: Date): Promise<VegrefAndVegsystemreferanse[]>;
    /**
     * Finds positions by given coordinates (northing and easting) and optional timestamp.
     * Returns an array of objects containing road reference, dates, position info, coordinates, and system reference.
     * @param northing - The northing coordinate.
     * @param easting - The easting coordinate.
     * @param tidspunkt - Optional timestamp for historical lookup.
     * @returns Promise resolving to an array of position and reference objects.
     */
    findPosisjonerByCoordinates(northing: number, easting: number, tidspunkt?: Date): Promise<VegrefAndVegsystemreferanse[]>;
}
//# sourceMappingURL=vegrefController.d.ts.map