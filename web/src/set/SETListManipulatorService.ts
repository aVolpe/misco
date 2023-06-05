import {Expense, Income} from "./Model";
import {SETService} from "./SETService";
import {ExpenseDocumentType, IncomeType} from './V2Enums';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);

type Filtrable = Pick<Income, 'identifier' | 'name' | 'date' | 'voucher'> & {
    type: keyof typeof IncomeType | keyof typeof ExpenseDocumentType
};

const SPECIAL_KEYS: string[] = ['type'];

export class SETListManipulatorService {

    private filter<T extends Filtrable>(data: Array<T>, query: string | undefined, from: dayjs.Dayjs, to: dayjs.Dayjs): T[] {
        const toSearch = (query || '');
        const typeToSearch = this.getTypeToSearch(toSearch);
        const fullText = this.cleanSearch(toSearch);
        console.log({fullText, typeToSearch});
        return data.filter(tf => {
            let valid = true;
            if (fullText)
                valid = tf.name.toLowerCase().includes(fullText)
                    || tf.identifier.toLowerCase().includes(fullText)
                    || (tf.voucher || '').toLowerCase().includes(fullText);
            if (typeToSearch) {
                // we need to translate it
                // TODO make this cast pretty
                const inSpanish = ExpenseDocumentType[tf.type as keyof typeof ExpenseDocumentType] || IncomeType[tf.type as keyof typeof IncomeType];
                valid = valid && (inSpanish).toLowerCase().includes(typeToSearch);
            }
            if (valid) {
                valid = SETService.mapLocalToMoment(tf.date).isBetween(from, to, undefined, "[]");
            }
            return valid
        })
    }

    getTypeToSearch(toSearch: string): string | undefined {
        // TODO implement other types of search
        // keep a space to simplify the code at the end
        let query = toSearch.toLowerCase().trim() + ' ';
        const keyword = 'type:';
        if (query.includes(keyword)) {
            const idx = query.indexOf(keyword) + keyword.length;
            return query.substring(idx, query.indexOf(' ', idx));
        }
        return undefined;
    }

    cleanSearch(toSearch: string) {

        // keep a space to simplify the code at the end
        let cleaned = toSearch.toLowerCase().trim() + ' ';

        for (const key of SPECIAL_KEYS) {
            const toClean = `${key}:`;
            if (cleaned.includes(toClean)) {
                const idx = cleaned.indexOf(toClean);
                console.log(`before removing '${toClean}': '${cleaned}'`);
                cleaned =
                    cleaned.substring(0, idx).trim() + // before
                    cleaned.substring(cleaned.indexOf(' ', idx)); // after
                console.log('cleaned: ' + cleaned);
            }
        }

        return cleaned.trim();
    }

    filterIncomes(data: Income[], query: string | undefined, from: dayjs.Dayjs, to: dayjs.Dayjs): Income[] {
        return this.filter(data, query, from, to);
    }

    filterExpenses(data: Expense[], query: string | undefined, from: dayjs.Dayjs, to: dayjs.Dayjs): Expense[] {
        return this.filter(data, query, from, to);
    }
}
