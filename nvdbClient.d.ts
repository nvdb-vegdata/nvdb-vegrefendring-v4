import type { Posisjon, HistoricVegobjektResponse } from "./nvdbTypes.ts";
import type { Vegreferanse } from "./vegreferanse.js";
export declare function setNvdbBaseUrl(url: string): void;
export declare const fetchHistoricVegreferanse: (vegreferanse: Vegreferanse, tidspunkt?: Date) => Promise<HistoricVegobjektResponse>;
export declare const fetchVegsystemReferanse: (veglenkesekvensid: number, position: number) => Promise<Posisjon | undefined>;
export declare const fetchPosisjonByVegsystemreferanse: (vegsystemreferanse: String, tidspunkt?: Date) => Promise<Posisjon>;
export declare const fetchPositionByLenkeposisjon: (veglenksekvensid: number, posisjon: number, tidspunkt?: Date) => Promise<Posisjon>;
export declare const fetchPositionByNordOst: (nord: number, ost: number, tidspunkt?: Date) => Promise<Posisjon[]>;
export declare const fetchHistoricVegreferanseByPosition: (veglenksekvensId: number, posisjon: number, tidspunkt?: Date) => Promise<HistoricVegobjektResponse>;
//# sourceMappingURL=nvdbClient.d.ts.map