import {ExpenseFormData} from '../components/ExpenseForm';
import {Egreso, Ingreso} from './ArandukaModel';
import {Person, query as QueryRuc} from '../RucAPI';
import {EGRESO_STATIC_DATA, EGRESO_TYPES, PersonType} from './ParametroEgreso';
import moment from 'moment';
import DigitGenerator from './DigitGenerator';
import {findLast} from 'lodash';
import {IncomeFormData} from '../components/IncomeForm';
import {INGRESO_STATIC_DATA, INGRESO_TYPES} from './ParametroIngreso';

export interface PersonWithLetterhead extends Person {
    letterhead?: string;
}

export class SETService {

    lastInvoiceId: number;
    lastIncomeId: number;

    constructor(private period: number,
                private owner: Person,
                private type: PersonType,
                private invoices: Egreso[] = [],
                private incomes: Ingreso[] = []) {
        this.lastInvoiceId = invoices.reduce((pv, cv) => {
            return pv < cv.id ? cv.id : pv
        }, 0);
        this.lastIncomeId = incomes.reduce((pv, cv) => {
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
            type: [source.tipo, source.tipoEgreso, source.subtipoEgreso],
            expenseNumber: source.timbradoDocumento,
            letterhead: source.timbradoNumero,
            date: SETService.mapDateToLocalFormat(source.fecha),
            isCredit: source.timbradoCondicion === 'credito'
        }
    }

    mapIngresoToForm(source: Ingreso): IncomeFormData {
        const date = source.fecha
            ? SETService.mapDateToLocalFormat(source.fecha)
            : source.mes
                ? SETService.mapMonthToLocalFormat(source.mes, source.periodo)
                : undefined;
        if (!date)
            throw new Error(`Can't get month from income ${source.fecha} - ${source.mes}`)
        return {
            amount: source.ingresoMontoTotal,
            owner: {
                doc: source.relacionadoNumeroIdentificacion,
                name: source.relacionadoNombres,
                div: source.relacionadoTipoIdentificacion,
                old: '',
                letterhead: source.timbradoNumero
            },
            type: [source.tipo, source.tipoIngreso],
            incomeNumber: source.timbradoDocumento,
            letterhead: source.timbradoNumero,
            date,
            isCredit: source.timbradoCondicion === 'credito'
        };
    }

    mapInvoice(source: ExpenseFormData, id?: number): Egreso {

        const kindData = EGRESO_STATIC_DATA[this.type]
            .find(el => el.codigo = source.type[0]);
        if (!kindData) throw Error(`King ${source.type[0]} not found`);
        const type = kindData.egresos.find(el => el.codigo === source.type[1]);
        if (!type) throw Error(`Type ${source.type[1]} not found`);
        const subtype = source.type[2];

        if (source.type[0] === "5" && source.type[1] === 'gasto' && source.type[2] === 'DESCJBPN') {
            return {
                mes: `${SETService.mapSETFormatToSetMonth(source.date)}`,
                egresoMontoTotal: source.amount,
                fecha: SETService.mapDateToSetFormat(source.date),
                id: id || ++this.lastInvoiceId,
                periodo: `${this.period}`,
                relacionadoNombres: source.owner.name,
                relacionadoNumeroIdentificacion: source.owner.doc,
                relacionadoTipoIdentificacion: 'RUC',
                ruc: this.owner.doc,
                subtipoEgreso: subtype,
                subtipoEgresoTexto: EGRESO_TYPES[subtype],
                tipo: kindData.codigo,
                tipoEgreso: type.codigo,
                tipoEgresoTexto: type.nombre,
                tipoTexto: kindData.nombre,
            }
        } else {
            return {
                egresoMontoTotal: source.amount,
                fecha: SETService.mapDateToSetFormat(source.date),
                id: id || ++this.lastInvoiceId,
                periodo: `${this.period}`,
                relacionadoNombres: source.owner.name,
                relacionadoNumeroIdentificacion: source.owner.doc,
                relacionadoTipoIdentificacion: 'RUC',
                ruc: this.owner.doc,
                subtipoEgreso: subtype,
                subtipoEgresoTexto: EGRESO_TYPES[subtype],
                tipo: kindData.codigo,
                tipoEgreso: type.codigo,
                tipoEgresoTexto: type.nombre,
                tipoTexto: kindData.nombre,

                timbradoCondicion: source.isCredit ? 'credito' : 'contado',
                timbradoDocumento: source.expenseNumber,
                timbradoNumero: source.letterhead,
            }
        }
    }

    mapIncome(source: IncomeFormData, id?: number): Ingreso {

        const kindData = INGRESO_STATIC_DATA[this.type]
        const type = kindData.find(el => el.codigo === source.type[0]);
        if (!type) throw Error(`Type ${source.type[0]} not found`);
        const subtype = source.type[1];

        if (source.type[0] === "5") {
            return {
                ingresoMontoGravado: source.amount,
                ingresoMontoNoGravado: 0,
                ingresoMontoTotal: source.amount,
                mes: `${SETService.mapSETFormatToSetMonth(source.date)}`,
                fecha: SETService.mapDateToSetFormat(source.date),
                id: id || ++this.lastIncomeId,
                periodo: `${this.period}`,
                relacionadoNombres: source.owner.name,
                relacionadoNumeroIdentificacion: source.owner.doc,
                relacionadoTipoIdentificacion: 'RUC',
                ruc: this.owner.doc,
                tipo: source.type[0],
                tipoIngreso: subtype,
                tipoIngresoTexto: INGRESO_TYPES[subtype],
                tipoTexto: type.nombre
            }
        } else {
            return {
                ingresoMontoGravado: source.amount,
                ingresoMontoNoGravado: 0,
                ingresoMontoTotal: source.amount,
                fecha: SETService.mapDateToSetFormat(source.date),
                id: id || ++this.lastIncomeId,
                periodo: `${this.period}`,
                relacionadoNombres: source.owner.name,
                relacionadoNumeroIdentificacion: source.owner.doc,
                relacionadoTipoIdentificacion: 'RUC',
                ruc: this.owner.doc,
                timbradoCondicion: source.isCredit ? 'credito' : 'contado',
                timbradoDocumento: source.incomeNumber,
                timbradoNumero: source.letterhead,
                tipo: source.type[0],
                tipoIngreso: subtype,
                tipoIngresoTexto: INGRESO_TYPES[subtype],
                tipoTexto: type.nombre
            }
        }
    }

    public async findRuc(query: string): Promise<PersonWithLetterhead> {

        let toRet: {
            relacionadoNumeroIdentificacion: string;
            timbradoNumero?: string;
            relacionadoNombres: string;
        } | undefined = findLast(this.invoices, f => query === f.relacionadoNumeroIdentificacion);

        if (!toRet) {
            toRet = findLast(this.incomes, f => query === f.relacionadoNumeroIdentificacion);
            if (toRet)
                toRet.timbradoNumero = '';
        }

        if (toRet) {
            return {
                doc: toRet.relacionadoNumeroIdentificacion,
                old: '',
                div: new DigitGenerator().getDigitoVerificadorBase11(toRet.relacionadoNumeroIdentificacion) + "",
                letterhead: toRet.timbradoNumero,
                name: toRet.relacionadoNombres
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

    public static mapSETFormatToSetMonth(source: string) {
        return moment(source, "YYYY-MM-DD").month() + 1;
    }

    public static mapMonthToLocalFormat(source: string, period: string) {
        return SETService.mapMomentToSETFormat(moment("1990-01-01")
            .month(parseInt(source) - 1)
            .year(parseInt(period)))
    }
}
