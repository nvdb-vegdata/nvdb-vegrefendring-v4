import type { HistoricVegobjektResponse, Posisjon } from './nvdbTypes.ts';
import type { Vegreferanse } from "./vegreferanse.js";
export declare class VegreferanseService {
    /**
     * Service class for handling operations related to Vegreferanse.
     */
    findVegreferanse(vegreferanse: Vegreferanse, tidspunkt?: Date): Promise<HistoricVegobjektResponse>;
    findPosisjonForVegsystemreferanse(vegsystemreferanse: String, tidspunkt?: Date): Promise<Posisjon>;
    findHistoricVegreferanseByLenkeposisjon(veglenkeskvensid: number, posisjon: number, tidspunkt?: Date): Promise<HistoricVegobjektResponse>;
    findVegsystemReferanseByLenkeposisjon(veglenkesekvensid: number, position: number, tidspunkt?: Date): Promise<Posisjon>;
    findPosisjonByNordOst(nord: number, ost: number, tidspunkt?: Date): Promise<Posisjon[]>;
    setBaseUrl(baseUrl: string): Promise<void>;
}
//# sourceMappingURL=vegrefService.d.ts.map