import {ArandukaExport, Egreso, Familiar, Identificacion, Informante, Ingreso, PresentationType} from './ArandukaModel';
import moment from 'moment';
import download from 'downloadjs';
import Papa from 'papaparse';
import {SETListManipulatorService} from './SETListManipulatorService';
import {SETService} from './SETService';

export class SETExporter {

    downloadData(data: ArandukaExport, nameFormat: 'FULL' | 'SIMPLE') {

        const fixed = this.fixDataTypes(data);
        const type = 'json';
        const now = moment().format('YYYYMMDDhhmm');
        const period = nameFormat === 'FULL' ? `${data.identificacion.periodo}_` : '';
        const pType = nameFormat === 'FULL' ? `${data.identificacion.tipoPresentacion}_` : '';
        const name = `${data.informante.ruc}_${period}${pType}${now}.${type}`;
        const ct = 'application/json';
        download(new Blob([JSON.stringify(fixed, null, 2)]), name, ct);
    }

    private fixDataTypes(data: ArandukaExport) {

        const toRet: ArandukaExport = JSON.parse(JSON.stringify(data));

        toRet.ingresos.forEach(i => {
            i.ingresoMontoGravado = Number(i.ingresoMontoGravado);
            i.ingresoMontoNoGravado = Number(i.ingresoMontoNoGravado);
            i.ingresoMontoTotal = Number(i.ingresoMontoTotal);
            i.periodo = SETService.mapSETFormatToMoment(i.fecha).year() + '';
        });

        toRet.egresos.forEach(i => {
            i.egresoMontoTotal = Number(i.egresoMontoTotal);

            // Fix all expenses where of type 'gasto' instead of the correct kind
            if (i.tipo === "gasto") {
                i.tipo = "1"
            }

            i.periodo = SETService.mapSETFormatToMoment(i.fecha).year() + '';
        });

        return toRet;

    }

    downloadExcel(informer: Informante, identifier: string, toDownload: any[]) {
        if (!Array.isArray(toDownload)) throw new Error('Invalid data to download');

        const columns = new Set(['id', 'periodo', 'tipo', 'fecha']);
        if (toDownload.length > 0) {
            Object.keys(toDownload[0]).forEach(k => columns.add(k));
        }

        const csv = Papa.unparse({
            fields: Array.from(columns),
            data: toDownload
        });
        console.log(csv);

        const now = moment().format('YYYYMMDDhhmm');
        const name = `${informer.ruc}_${identifier}_${now}.csv`;

        download(new Blob([csv]), name, 'text/csv');
    }

    downloadPeriod(data: {
        ingresos: Ingreso[];
        familiares: Familiar[];
        identificacion: Identificacion;
        egresos: Egreso[];
        informante: Informante
    }, period: number, type: PresentationType) {

        const filterer = new SETListManipulatorService();

        const from = moment(`${period}-01-01`);
        const to = moment(`${period}-12-31`);

        const incomes = filterer.filterIncomes(clone(data.ingresos), undefined, from, to);
        const expenses = filterer.filterExpenses(clone(data.egresos), undefined, from, to);


        this.downloadData({
            familiares: data.familiares,
            informante: data.informante,
            identificacion: {
                version: '1.0.3',
                periodo: `${period}`,
                tipoPresentacion: type,
                tipoMovimiento: (incomes.length + expenses.length) > 0 ? 'CON_MOVIMIENTO' : 'SIN_MOVIMIENTO'
            },
            ingresos: incomes,
            egresos: expenses
        }, 'FULL')
    }
}

function clone<T>(data: T[]): T[] {
    return JSON.parse(JSON.stringify(data));
}
