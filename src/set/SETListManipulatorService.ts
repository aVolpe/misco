import {Expense, Income} from "./Model";
import {SETService} from "./SETService";
import {ExpenseDocumentType, IncomeType} from './V2Enums';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

type Filtrable = Pick<Income, 'identifier' | 'name' | 'date' | 'voucher' | 'tags' | 'id'> & {
    type: keyof typeof IncomeType | keyof typeof ExpenseDocumentType
};

const SPECIAL_KEYS: SPECIAL_KEY_TYPES[] = ['type', 'tags', 'tag', 'cat', 'id'];
type SPECIAL_KEY_TYPES = 'type' | 'tags' | 'tag' | 'cat' | 'id';

export class SETListManipulatorService {

    private filter<T extends Filtrable>(data: Array<T>, query: string | undefined, from: dayjs.Dayjs, to: dayjs.Dayjs, tags: string[] = []): T[] {
        const toSearch = (query || '');
        const typeToSearch = this.getTypeToSearch(toSearch);
        const tagToSearch = [...tags, ...this.getTagToSearch(toSearch)];
        const fullText = this.cleanSearch(toSearch);
        const idParam = this._extractPropertySearch(toSearch, 'id');
        const idRangeToSearch = idParam?.includes("..")
            ? {
                from: parseInt(idParam?.substring(0, idParam.indexOf(".."))),
                to: parseInt(idParam?.substring(idParam.indexOf("..") + 2))
            }
            : undefined;
        const idToSearch = !idRangeToSearch && idParam ? parseInt(idParam) : undefined;
        console.log({
            fullText,
            typeToSearch,
            idParam,
            idRangeToSearch,
            tagToSearch: tagToSearch?.join(","),
            from: from.toString(),
            to: to.toString()
        });
        return data.filter(tf => {
            let valid = true;
            if (idToSearch) {
                valid = idToSearch === tf.id;
            }
            if (idRangeToSearch) {
                valid = tf.id >= idRangeToSearch.from && tf.id <= idRangeToSearch.to;
            }
            if (valid && fullText)
                valid = tf.name.toLowerCase().includes(fullText)
                    || tf.identifier.toLowerCase().includes(fullText)
                    || (tf.voucher || '').toLowerCase().includes(fullText);

            if (valid) {
                valid = SETService.mapLocalToMoment(tf.date).isBetween(from, to, undefined, "[]");
            }

            if (typeToSearch && valid) {
                // we need to translate it
                // TODO make this cast pretty
                const inSpanish = ExpenseDocumentType[tf.type as keyof typeof ExpenseDocumentType] || IncomeType[tf.type as keyof typeof IncomeType];
                valid = inSpanish.toLowerCase().includes(typeToSearch);
            }
            if (tagToSearch && valid) {
                const tags = tf.tags || [];
                valid = tagToSearch.filter(tag => {
                    const tagName = tag.startsWith("!")
                        ? tag.substring(1)
                        : tag;
                    return tag.startsWith("!")
                        // negative search, in the case the tag must not be present
                        ? !tags.find(t => t === tagName)
                        : tags.find(t => t === tagName);
                }).length === tagToSearch.length;
            }
            return valid
        })
    }

    getCatToSearch(toSearch: string): string | undefined {
        return this._extractPropertySearch(toSearch, "cat")
    }

    getTypeToSearch(toSearch: string): string | undefined {
        return this._extractPropertySearch(toSearch, "type")
    }

    getTagToSearch(toSearch: string): string[] {
        const val = this._extractPropertySearch(toSearch, 'tag')
            || this._extractPropertySearch(toSearch, 'tags');
        return val?.toUpperCase().split(",") || [];
    }

    _extractPropertySearch(toSearch: string, key: SPECIAL_KEY_TYPES): string | undefined {
        let query = toSearch.toLowerCase().trim() + ' ';
        const fullKey = key + ":";
        if (query.includes(fullKey)) {
            const idx = query.indexOf(fullKey) + fullKey.length;
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
                cleaned =
                    cleaned.substring(0, idx).trim() + // before
                    cleaned.substring(cleaned.indexOf(' ', idx)); // after
            }
        }

        return cleaned.trim();
    }
    
    findByInvoiceNumber(invoiceNumber: string, identifier: string, expenses: Expense[], incomes: Income[]): {
        income?: Income,
        expense?: Expense
    } {
        console.log({invoiceNumber, identifier})
        const income = incomes.find(f => f.voucher === invoiceNumber && f.identifier === identifier);
        if (income) return {income};
        const expense = expenses.find(f => f.voucher === invoiceNumber && f.identifier === identifier);
        if (expense) return {expense};
        return {};
    }
    
    findLastByIdentifier(identifier: string, expenses: Expense[], incomes: Income[]): {
        income?: Income,
        expense?: Expense
    } {
        const income = incomes.filter(f => f.identifier === identifier).sort((a, b) => a.date.localeCompare(b.date)).pop();
        if (income) return {income};
        const expense = expenses.filter(f => f.identifier === identifier).sort((a, b) => a.date.localeCompare(b.date)).pop();
        if (expense) return {expense};
        return {};
    }


    filterAll(expenses: Expense[], incomes: Income[], query: string | undefined, from: dayjs.Dayjs, to: dayjs.Dayjs, tags: string[]): {
        incomes: Income[],
        expenses: Expense[]
    } {
        const cat = this.getCatToSearch(query || '');
        if (!cat) return {
            expenses: this.filterExpenses(expenses, query, from, to, tags),
            incomes: this.filterIncomes(incomes, query, from, to)
        }
        if (cat.startsWith('income')) {
            return {
                incomes: this.filterIncomes(incomes, query, from, to),
                expenses: []
            }
        }
        if (cat.startsWith('expense')) {
            return {
                incomes: [],
                expenses: this.filterExpenses(expenses, query, from, to, tags)
            }
        }
        throw new Error(`invalid category: ${cat}`);
    }

    filterIncomes(data: Income[], query: string | undefined, from: dayjs.Dayjs, to: dayjs.Dayjs): Income[] {
        return this.filter(data, query, from, to);
    }

    filterExpenses(data: Expense[], query: string | undefined, from: dayjs.Dayjs, to: dayjs.Dayjs, tags?: string[]): Expense[] {
        return this.filter(data, query, from, to, tags);
    }
}
