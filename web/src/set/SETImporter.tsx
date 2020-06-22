import {writeStorage} from '@rehooks/local-storage';
import {ArandukaExport, Ingreso} from './ArandukaModel';
import moment from 'moment';
import {SETService} from './SETService';

export class SETImporter {

    doImport(data: ArandukaExport) {

        writeStorage('informante', data.informante);
        writeStorage('ingresos', this.fixIncomes(data.ingresos));
        writeStorage('egresos', data.egresos);
        writeStorage('identificacion', data.identificacion);
        writeStorage('familiares', data.familiares);
    }

    private fixIncomes(ingresos: Ingreso[]): Ingreso[] {
        if (!ingresos || ingresos.length === 0) return ingresos || [];

        return ingresos.map(ingreso => {
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
