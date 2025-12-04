export class Vegreferanse {
    vegkategori;
    vegstatus;
    vegnummer;
    fylke;
    kommune;
    meter;
    parsell; /* 1-49 (hovedparsell), 50-69 (Armer), 70-199 (Ramper), 400-599 (Rundkjøringer),
                         600-699 (Skjøteparsell), 800-998 (Trafikklommer, rasteplasser) */
    static createFromString(vegreferanse) {
        const vegrefMatch = vegreferanse.match(/^(\d{4})([a-zA-Z])([a-zA-Z])(\d+)hp(\d+)m(\d+)$/);
        if (vegrefMatch === null
            || vegrefMatch[1] === undefined
            || vegrefMatch[2] === undefined
            || vegrefMatch[3] === undefined
            || vegrefMatch[4] === undefined
            || vegrefMatch[5] === undefined
            || vegrefMatch[6] === undefined) {
            throw new Error(`Unknown vegref match: ${vegreferanse}`);
        }
        return new Vegreferanse(Number(vegrefMatch[1].substring(0, 2)), Number(vegrefMatch[1].substring(2, 4)), Vegkategori[vegrefMatch[2].toUpperCase()], Vegstatus[vegrefMatch[3].toUpperCase()], Number(vegrefMatch[4]), Number(vegrefMatch[5]), Number(vegrefMatch[6]));
    }
    constructor(fylke, kommune, vegkategori, status, vegnummer, hp, meter) {
        this.fylke = fylke;
        this.kommune = kommune;
        this.vegkategori = vegkategori;
        this.vegstatus = status;
        this.vegnummer = vegnummer;
        this.parsell = hp;
        this.meter = meter;
        this.meter = meter;
    }
}
export var Vegkategori;
(function (Vegkategori) {
    Vegkategori[Vegkategori["E"] = 5492] = "E";
    Vegkategori[Vegkategori["R"] = 5493] = "R";
    Vegkategori[Vegkategori["F"] = 5494] = "F";
    Vegkategori[Vegkategori["K"] = 5495] = "K";
    Vegkategori[Vegkategori["P"] = 5496] = "P";
    Vegkategori[Vegkategori["S"] = 5497] = "S"; /* Kommunal veg */
})(Vegkategori || (Vegkategori = {}));
export var Vegstatus;
(function (Vegstatus) {
    Vegstatus[Vegstatus["V"] = 5499] = "V";
    Vegstatus[Vegstatus["W"] = 5505] = "W";
    Vegstatus[Vegstatus["T"] = 5502] = "T";
    Vegstatus[Vegstatus["S"] = 5504] = "S";
    Vegstatus[Vegstatus["G"] = 12159] = "G";
    Vegstatus[Vegstatus["U"] = 12983] = "U";
    Vegstatus[Vegstatus["B"] = 13707] = "B";
    Vegstatus[Vegstatus["M"] = 5501] = "M";
    Vegstatus[Vegstatus["X"] = 5500] = "X";
    Vegstatus[Vegstatus["A"] = 7041] = "A";
    Vegstatus[Vegstatus["H"] = 12160] = "H";
    Vegstatus[Vegstatus["P"] = 7042] = "P";
    Vegstatus[Vegstatus["E"] = 7046] = "E";
    Vegstatus[Vegstatus["Q"] = 12986] = "Q"; /* Planlagt gang-/sykkelveg */
})(Vegstatus || (Vegstatus = {}));
//# sourceMappingURL=vegreferanse.js.map