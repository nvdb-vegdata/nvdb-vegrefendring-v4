import { fetchHistoricVegreferanse, fetchHistoricVegreferanseByPosition, fetchPosisjonByVegsystemreferanse, fetchPositionByLenkeposisjon, fetchPositionByNordOst, setNvdbBaseUrl } from "./nvdbClient.js";
export class VegreferanseService {
    /**
     * Service class for handling operations related to Vegreferanse.
     */
    async findVegreferanse(vegreferanse, tidspunkt) {
        return fetchHistoricVegreferanse(vegreferanse, tidspunkt);
    }
    async findPosisjonForVegsystemreferanse(vegsystemreferanse, tidspunkt) {
        return fetchPosisjonByVegsystemreferanse(vegsystemreferanse, tidspunkt);
    }
    async findHistoricVegreferanseByLenkeposisjon(veglenkeskvensid, posisjon, tidspunkt) {
        return fetchHistoricVegreferanseByPosition(veglenkeskvensid, posisjon, tidspunkt);
    }
    async findVegsystemReferanseByLenkeposisjon(veglenkesekvensid, position, tidspunkt) {
        return fetchPositionByLenkeposisjon(veglenkesekvensid, position, tidspunkt);
    }
    async findPosisjonByNordOst(nord, ost, tidspunkt) {
        return fetchPositionByNordOst(nord, ost, tidspunkt);
    }
    async setBaseUrl(baseUrl) {
        setNvdbBaseUrl(baseUrl);
    }
}
//# sourceMappingURL=vegrefService.js.map