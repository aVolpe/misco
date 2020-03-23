import {writeStorage} from '@rehooks/local-storage';

export class SETImporter {

    doImport(data: any) {

        writeStorage('informante', data.informante);
        writeStorage('ingresos', data.ingresos);
        writeStorage('egresos', data.egresos);
        writeStorage('identificacion', data.identificacion);
        writeStorage('identificacion', data.identificacion);
    }
}
