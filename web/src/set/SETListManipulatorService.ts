import {Egreso, Ingreso} from './ArandukaModel';
import * as moment from 'moment';
import {SETService} from './SETService';

type Filtrable = Pick<Ingreso, 'relacionadoNombres' | 'relacionadoNumeroIdentificacion' | 'timbradoDocumento' | 'fecha'>;

export class SETListManipulatorService {

    private filter<T extends Filtrable>(data: Array<T>, query: string | undefined, from: moment.Moment, to: moment.Moment): T[] {
        const toSearch = (query || '').toLowerCase().trim();
        return data.filter(tf => {
            let valid = true;
            if (toSearch)
                valid = tf.relacionadoNombres.toLowerCase().includes(toSearch)
                    || tf.relacionadoNumeroIdentificacion.toLowerCase().includes(toSearch)
                    || tf.timbradoDocumento.toLowerCase().includes(toSearch);
            if (valid) {
                valid = SETService.mapSETFormatToMoment(tf.fecha).isBetween(from, to);
            }
            return valid
        })
    }

    filterIncomes(data: Ingreso[], query: string | undefined, from: moment.Moment, to: moment.Moment): Ingreso[] {
        return this.filter(data, query, from, to);
    }

    filterExpenses(data: Egreso[], query: string | undefined, from: moment.Moment, to: moment.Moment): Egreso[] {
        return this.filter(data, query, from, to);
    }
}
