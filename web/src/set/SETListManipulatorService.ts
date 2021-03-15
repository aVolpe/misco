import moment from 'moment';
import {Expense, Income} from "./Model";
import {SETService} from "./SETService";

type Filtrable = Pick<Income, 'identifier' | 'name' | 'date' | 'voucher'>;

export class SETListManipulatorService {

    private filter<T extends Filtrable>(data: Array<T>, query: string | undefined, from: moment.Moment, to: moment.Moment): T[] {
        const toSearch = (query || '').toLowerCase().trim();
        return data.filter(tf => {
            let valid = true;
            if (toSearch)
                valid = tf.name.toLowerCase().includes(toSearch)
                    || tf.identifier.toLowerCase().includes(toSearch)
                    || (tf.voucher || '').toLowerCase().includes(toSearch);
            if (valid) {
                valid = SETService.mapLocalToMoment(tf.date).isBetween(from, to, undefined, "[]");
            }
            return valid
        })
    }

    filterIncomes(data: Income[], query: string | undefined, from: moment.Moment, to: moment.Moment): Income[] {
        return this.filter(data, query, from, to);
    }

    filterExpenses(data: Expense[], query: string | undefined, from: moment.Moment, to: moment.Moment): Expense[] {
        return this.filter(data, query, from, to);
    }
}
