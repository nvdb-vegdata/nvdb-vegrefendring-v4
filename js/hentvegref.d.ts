import type { FeatureCollectionPoints } from "./interfaces.ts";
export declare class HentVegref {
    baseUrl: string;
    baseUrlV4: string;
    constructor();
    fetchXML(url: string): Promise<Document>;
    fetchJSON(url: string): Promise<{
        type: string;
        features: {
            type: string;
            properties: {
                vegsystemreferanse: any;
                veglenkesekvens: any;
                geometri: any;
                kommune: any;
            };
        }[];
    }>;
    veglenkesekvens(linkid: number, position: number): Promise<{
        type: string;
        features: never[];
    }>;
    toRoadlinkCollection(jsonDoc: Record<string, any>): {
        type: string;
        features: {
            type: string;
            properties: {
                vegsystemreferanse: any;
                veglenkesekvens: any;
                geometri: any;
                kommune: any;
            };
        }[];
    };
    veglenkesekvensLesV4(params: {
        linkIds: string[];
    }): Promise<{
        type: string;
        features: {
            type: string;
            properties: {
                vegsystemreferanse: any;
                veglenkesekvens: any;
                geometri: any;
                kommune: any;
            };
        }[];
    }>;
    xmlElementToGeoJSON(element: Element, dagensverdi: boolean): FeatureCollectionPoints | undefined;
    createVegrefString(element: Element): string;
}
//# sourceMappingURL=hentvegref.d.ts.map