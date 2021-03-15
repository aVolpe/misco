import {writeStorage} from '@rehooks/local-storage';
import {ArandukaExport, Ingreso} from './ArandukaModel';
import moment from 'moment';
import {SETService} from './SETService';
import {Income} from "./Model";

export class SETImporter {

    doImport(data: ArandukaExport) {

        // check for v2 format
        const dat: any = data;

        if ('informer' in dat) {
            // it's v2 data
            writeStorage('informante', dat.informer);
            writeStorage('ingresos', dat.incomes);
            writeStorage('egresos', dat.expenses);
            return;
        }

        writeStorage('informante', data.informante);
        writeStorage('ingresos', this.fixIncomes(data.ingresos));
        writeStorage('egresos', data.egresos);
        writeStorage('identificacion', data.identificacion);
        writeStorage('familiares', data.familiares);
    }

    private fixIncomes(ingresos: Array<Ingreso| Income>): Ingreso[] {
        if (!ingresos || ingresos.length === 0) return [];

        return ingresos.map(ingreso => {
            if ('version' in ingreso) {
                // it's an income, skip it
                return ingreso as any; // this is an invalid cast but we need it
            }
            let newFecha = ingreso.fecha;
            if (!newFecha) {
                if (ingreso.mes) {
                    newFecha = SETService.mapMomentToSETFormat(moment("1990-01-01")
                        .month(parseInt(ingreso.mes) - 1)
                        .year(parseInt(ingreso.periodo)));
                } else {
                    throw new Error(`Ingreso inválido, verificar ${ingreso.id} con fecha ${ingreso.fecha} mes ${ingreso.mes}`);
                }
            }
            return {
                ...ingreso,
                fecha: newFecha
            }
        });
    }
}
