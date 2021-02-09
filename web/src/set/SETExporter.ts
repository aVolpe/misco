import {ArandukaExport, Egreso, Familiar, Identificacion, Informante, Ingreso, PresentationType} from './ArandukaModel';
import moment from 'moment';
import download from 'downloadjs';
import Papa from 'papaparse';
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
            if (i.fecha)
                i.periodo = SETService.mapSETFormatToMoment(i.fecha).year() + '';

            if (i.tipo === "5") {
                i.mes = `${SETService.mapSETFormatToSetMonth(i.fecha)}`;
                delete i.fecha;
                delete i.timbradoDocumento;
                delete i.timbradoCondicion;
                delete i.timbradoNumero;
            }
        });

        toRet.egresos.forEach(e => {
            e.egresoMontoTotal = Number(e.egresoMontoTotal);

            // Fix all expenses where of type 'gasto' instead of the correct kind
            if (e.tipo === "gasto") {
                e.tipo = "1"
            }

            e.periodo = SETService.mapSETFormatToMoment(e.fecha).year() + '';

            if (
                e.tipo === "5" && e.tipoEgreso === 'gasto' && e.subtipoEgreso === 'DESCJBPN'
            ) {
                e.mes = `${SETService.mapSETFormatToSetMonth(e.fecha)}`;
                // delete e.fecha;
                delete e.timbradoDocumento;
                delete e.timbradoCondicion;
                delete e.timbradoNumero;
            }
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

        alert("TODO: Not implemented")
    }
}

