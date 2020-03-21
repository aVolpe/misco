import {InvoiceFormData} from '../components/InvoiceEditorComponent';
import {Egreso} from '../set/ArandukaModel';
import {Person} from '../RucAPI';
import {EGRESO_STATIC_DATA, EGRESO_TYPES, PersonType} from '../set/ParametroEgreso';
import moment from 'moment';

export class SETService {

    lastId: number;

    constructor(private period: number,
                private owner: Person,
                private type: PersonType,
                private previous: Egreso[] = []) {
        this.lastId = previous.reduce((pv, cv) => {
            return pv < cv.id ? pv : cv.id
        }, 0);
    }

    mapToForm(source: Egreso): InvoiceFormData {
        return {
            amount: source.egresoMontoTotal,
            owner: {
                doc: source.relacionadoNumeroIdentificacion,
                name: source.relacionadoNombres,
                div: source.relacionadoTipoIdentificacion,
                old: ''
            },
            type: [source.tipoEgreso, source.subtipoEgreso],
            invoiceNumber: source.timbradoDocumento,
            letterhead: source.timbradoNumero,
            date: SETService.mapDateToLocalFormat(source.fecha)
        }
    }

    mapInvoice(source: InvoiceFormData): Egreso {

        const type = EGRESO_STATIC_DATA[this.type].find(el => el.codigo === source.type[0]);
        if (!type) throw Error(`Type ${source.type[0]} not founs`);
        const subtype = source.type[1];

        return {
            egresoMontoTotal: source.amount,
            fecha: SETService.mapDateToSetFormat(source.date),
            id: ++this.lastId,
            periodo: `${this.period}`,
            relacionadoNombres: source.owner.name,
            relacionadoNumeroIdentificacion: source.owner.doc,
            relacionadoTipoIdentificacion: 'RUC',
            ruc: this.owner.doc,
            subtipoEgreso: subtype,
            subtipoEgresoTexto: EGRESO_TYPES[subtype],
            timbradoCondicion: 'contado',
            timbradoDocumento: source.invoiceNumber,
            timbradoNumero: source.letterhead,
            tipo: type.codigo,
            tipoEgreso: type.codigo,
            tipoEgresoTexto: type.nombre,
            tipoTexto: 'Factura'
        }

    }

    private static mapDateToSetFormat(source: string) {
        return moment(source, "DD/mm/YY").format("YYYY-mm-DD")
    }

    private static mapDateToLocalFormat(source: string) {
        return moment(source, "YYYY-mm-DD").format("DD/mm/YY")
    }

}
