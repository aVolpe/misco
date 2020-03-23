import {ArandukaExport} from './ArandukaModel';
import moment from 'moment';
import download from 'downloadjs';

export class SETExporter {

    downloadData(data: ArandukaExport) {

        const fixed = this.fixDataTypes(data);
        const type = 'json';
        const now = moment().format('YYYYMMDDhhmm');
        const name = `${data.informante.ruc}_${data.identificacion.periodo}_${data.identificacion.tipoPresentacion}_${now}.${type}`;
        const ct = 'application/json';
        download(new Blob([JSON.stringify(fixed, null, 2)]), name, ct);
    }

    private fixDataTypes(data: ArandukaExport) {

        const toRet: ArandukaExport = JSON.parse(JSON.stringify(data));

        toRet.ingresos.forEach(i => {
            i.ingresoMontoGravado = Number(i.ingresoMontoGravado);
            i.ingresoMontoNoGravado = Number(i.ingresoMontoNoGravado);
            i.ingresoMontoTotal = Number(i.ingresoMontoTotal);
        });

        toRet.egresos.forEach(i => {
            i.egresoMontoTotal = Number(i.egresoMontoTotal);

            // Fix all expenses where of type 'gasto' instead of the correct kind
            if (i.tipo === "gasto") {
                i.tipo = "1"
            }
        });

        return toRet;

    }

    downloadExcel(toDownload: any[]) {

    }
}
