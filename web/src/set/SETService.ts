import {ExpenseFormData} from '../components/ExpenseForm';
import {Person, query as QueryRuc} from '../RucAPI';
import {PersonType} from './ParametroEgreso';
import DigitGenerator from './DigitGenerator';
import {findLast} from 'lodash';
import {IncomeFormData} from '../components/IncomeForm';
import {Expense, Income} from "./Model";
import dayjs from 'dayjs';

export interface PersonWithLetterhead extends Person {
    letterhead?: string;
}

export class SETService {

    lastInvoiceId: number;
    lastIncomeId: number;

    constructor(private period: number,
                private owner: Person,
                private type: PersonType,
                private invoices: Expense[] = [],
                private incomes: Income[] = []) {
        this.lastInvoiceId = invoices.reduce((pv, cv) => {
            return pv < cv.id ? cv.id : pv
        }, 0);
        this.lastIncomeId = incomes.reduce((pv, cv) => {
            return pv < cv.id ? cv.id : pv
        }, 0);
    }

    mapToForm(source: Expense): ExpenseFormData {
        return {
            amount: source.amount,
            owner: {
                doc: source.identifier,
                name: source.name,
                div: new DigitGenerator().getDigitoVerificadorBase11(source.identifier) + "",
                old: '',
                letterhead: source.letterhead
            },
            type: source.type,
            expenseNumber: source.voucher,
            letterhead: source.letterhead,
            date: SETService.storageToFormDate(source.date),
            isCredit: source.paymentType === 'credit'
        }
    }

    mapIngresoToForm(source: Income): IncomeFormData {
        return {
            amount: source.amount,
            owner: {
                doc: source.identifier,
                name: source.name,
                div: '',
                old: '',
                letterhead: ''
            },
            type: source.type,
            incomeNumber: source.voucher,
            letterhead: source.letterhead,
            date: source.date,
            isCredit: source.paymentType === 'credit'
        };
    }

    mapInvoice(source: ExpenseFormData, id?: number): Expense {

        return {
            date: SETService.dateToStorageFormat(source.date),
            id: id || ++this.lastInvoiceId,
            paymentType: source.isCredit ? 'credit' : 'cash',
            voucher: source.expenseNumber,
            letterhead: source.letterhead,
            type: source.type,
            identifier: source.owner.doc,
            amount: source.amount,
            name: source.owner.name,
            irpAmount: 0,
            identifierType: 'ruc',
            version: 2
        };
    }

    mapIncome(source: IncomeFormData, id?: number): Income {

        return {
            id: id || ++this.lastIncomeId,
            letterhead: source.letterhead,
            paymentType: source.isCredit ? 'credit' : 'cash',
            date: SETService.dateToStorageFormat(source.date),
            voucher: source.incomeNumber,
            type: source.type,
            name: source.owner.name,
            identifier: source.owner.doc,
            amount: source.amount,
            irpAmount: 0,
            identifierType: 'ruc',
            version: 2
        }
    }

    public async findRuc(query: string): Promise<PersonWithLetterhead> {

        let toRet: {
            identifier: string;
            letterhead?: string;
            name: string;
        } | undefined = findLast(this.invoices, f => query === f.identifier);

        if (!toRet) {
            toRet = findLast(this.incomes, f => query === f.identifier);
            if (toRet)
                toRet.letterhead = '';
        }

        if (toRet) {
            return {
                doc: toRet.identifier,
                old: '',
                div: new DigitGenerator().getDigitoVerificadorBase11(toRet.identifier) + "",
                letterhead: toRet.letterhead,
                name: toRet.name
            }
        }

        const fromApi = await QueryRuc(query);
        if (!fromApi || !fromApi.length) {
            return {
                letterhead: '',
                name: '',
                div: '',
                old: '',
                doc: ''
            }
        }
        if (!isNaN(Number(query))) {
            const found = fromApi.find(f => f.doc === query);
            if (found) {
                return {
                    ...found,
                    letterhead: ''
                }
            }
        }
        return {
            ...fromApi[0],
            letterhead: ''
        }
    }

    private static mapDateToSetFormat(source: string) {
        return dayjs(source, "DD/MM/YY").format("YYYY-MM-DD")
    }

    /**
     * Converts a date to the storage format
     */
    private static dateToStorageFormat(source: string) {
        if (source.length === 10) {
            // it doesn't like a short date
            if (source === dayjs(source, "YYYY/MM/DD").format("YYYY/MM/DD")) {
                // it's already a long date
                return source;
            }
            throw new Error("Invalid short date: " + source);
        }
        return dayjs(source, "DD/MM/YY").format("YYYY/MM/DD")
    }

    public static mapDateFromSetFormat(source: string) {
        return dayjs(source, "YYYY-MM-DD").format("DD/MM/YY")
    }

    public static mapSETFormatToMoment(source: string): dayjs.Dayjs {
        return dayjs(source, "YYYY-MM-DD");
    }

    public static mapMomentToSETFormat(source: dayjs.Dayjs): string {
        return source.format('YYYY-MM-DD');
    }

    public static mapSETFormatToSetMonth(source: string) {
        return dayjs(source, "YYYY-MM-DD").month() + 1;
    }

    public static mapMonthToLocalFormat(source: string, period: string) {
        return SETService.mapMomentToSETFormat(dayjs("1990-01-01")
            .month(parseInt(source) - 1)
            .year(parseInt(period)));
    }

    static mapLocalToMoment(date: string) {
        return dayjs(date, "YYYY/MM/DD");
    }

    static storageToFormDate(date: string) {
        return SETService.mapLocalToMoment(date).format("DD/MM/YY");
    }
}
