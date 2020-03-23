import {writeStorage} from '@rehooks/local-storage';
import {ArandukaExport} from './ArandukaModel';

export class SETImporter {

    doImport(data: ArandukaExport) {

        writeStorage('informante', data.informante);
        writeStorage('ingresos', data.ingresos);
        writeStorage('egresos', data.egresos);
        writeStorage('identificacion', data.identificacion);
        writeStorage('familiares', data.familiares);
    }
}
