import {ExpenseFormData} from '../components/ExpenseForm';
import {Egreso} from './ArandukaModel';
import {Person, query as QueryRuc} from '../RucAPI';
import {EGRESO_STATIC_DATA, EGRESO_TYPES, PersonType} from './ParametroEgreso';
import moment from 'moment';
import DigitGenerator from './DigitGenerator';
import { findLast } from 'lodash';

export interface PersonWithLetterhead extends Person {
    letterhead?: string;
}

export class SETService {

    lastId: number;

    constructor(private period: number,
                private owner: Person,
                private type: PersonType,
                private previous: Egreso[] = []) {
        this.lastId = previous.reduce((pv, cv) => {
            return pv < cv.id ? cv.id : pv
        }, 0);
    }

    mapToForm(source: Egreso): ExpenseFormData {
        return {
            amount: source.egresoMontoTotal,
            owner: {
                doc: source.relacionadoNumeroIdentificacion,
                name: source.relacionadoNombres,
                div: source.relacionadoTipoIdentificacion,
                old: '',
                letterhead: source.timbradoNumero
            },
            type: [source.tipoEgreso, source.subtipoEgreso],
            expenseNumber: source.timbradoDocumento,
            letterhead: source.timbradoNumero,
            date: SETService.mapDateToLocalFormat(source.fecha),
            isCredit: source.timbradoCondicion === 'credito'
        }
    }

    mapInvoice(source: ExpenseFormData, id?: number): Egreso {

        const kind = 'Factura';

        const kindData = EGRESO_STATIC_DATA[this.type]
            .find(el => el.nombre = kind);
        if (!kindData) throw Error(`King ${kind} not found`);
        const type = kindData.egresos.find(el => el.codigo === source.type[0]);
        if (!type) throw Error(`Type ${source.type[0]} not found`);
        const subtype = source.type[1];

        return {
            egresoMontoTotal: source.amount,
            fecha: SETService.mapDateToSetFormat(source.date),
            id: id || ++this.lastId,
            periodo: `${this.period}`,
            relacionadoNombres: source.owner.name,
            relacionadoNumeroIdentificacion: source.owner.doc,
            relacionadoTipoIdentificacion: 'RUC',
            ruc: this.owner.doc,
            subtipoEgreso: subtype,
            subtipoEgresoTexto: EGRESO_TYPES[subtype],
            timbradoCondicion: source.isCredit ? 'credito' : 'contado',
            timbradoDocumento: source.expenseNumber,
            timbradoNumero: source.letterhead,
            tipo: kindData.codigo,
            tipoEgreso: type.codigo,
            tipoEgresoTexto: type.nombre,
            tipoTexto: kind
        }
    }

    public async findRuc(query: string): Promise<PersonWithLetterhead> {

        const fromExpenses = findLast(this.previous, f => query === f.relacionadoNumeroIdentificacion);

        if (fromExpenses) {
            return {
                doc: fromExpenses.relacionadoNumeroIdentificacion,
                old: '',
                div: new DigitGenerator().getDigitoVerificadorBase11(fromExpenses.relacionadoNumeroIdentificacion) + "",
                letterhead: fromExpenses.timbradoNumero,
                name: fromExpenses.relacionadoNombres
            }
        }

        const fromApi = await QueryRuc(query);
        if (!fromApi || !fromApi.length) {
            return {
                letterhead: '',
                name: '',
                div: '',
                old: '',
                doc: ''
            }
        }
        if (!isNaN(Number(query))) {
            const found = fromApi.find(f => f.doc === query);
            if (found) {
                return {
                    ...found,
                    letterhead: ''
                }
            }
        }
        return {
            ...fromApi[0],
            letterhead: ''
        }
    }

    private static mapDateToSetFormat(source: string) {
        return moment(source, "DD/MM/YY").format("YYYY-MM-DD")
    }

    private static mapDateToLocalFormat(source: string) {
        return moment(source, "YYYY-MM-DD").format("DD/MM/YY")
    }

    public static mapSETFormatToMoment(source: string): moment.Moment {
        return moment(source, "YYYY-MM-DD");
    }

    public static mapMomentToSETFormat(source: moment.Moment): string {
        return source.format('YYYY-MM-DD')
    }

}
