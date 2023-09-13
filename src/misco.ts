import {useLocalStorage} from '@rehooks/local-storage';
import {Expense, Income, User} from './set/Model';
import {useEffect, useMemo, useState} from 'react';
import {VersionMigrator} from './set/VersionMigrator';
import {Person} from './RucAPI';
import {ExpenseFormData} from './components/ExpenseForm';
import {PersonWithLetterhead, SETService} from './set/SETService';
import {IncomeFormData} from './components/IncomeForm';


const vm = new VersionMigrator();

export type MiscoState = {
    isMigrating: boolean,
    expenses: Expense[],
    saveExpense: (expense: ExpenseFormData, id?: number) => { wasNew: boolean },
    updateExpense: (expense: Expense) => void,
    updateExpenses: (expense: Expense[]) => void,
    addExpenses: (expense: ExpenseFormData[]) => void,
    removeExpense: (id: number) => void,
    removeIncome: (id: number) => void,
    clearAllData: () => void,
    informer: User,
    owner: Person,
    period: number,
    incomes: Income[],
    saveIncome: (income: IncomeFormData, id?: number) => { wasNew: boolean }
    searchRuc: (ruc: string) => Promise<PersonWithLetterhead>
}


/**
 * Handles all the state of the site, currently it can be only used one time (for the migration flag)
 */
export function useMiscoState(): MiscoState {

    const [informer, setInformer, clearInformer] = useLocalStorage<User>('informante');
    const [incomes, setIncomes, clearIncomes] = useLocalStorage<Income[]>('ingresos', []);
    const [expenses, setExpenses, clearExpenses] = useLocalStorage<Expense[]>('egresos', []);
    const [migration, setMigration] = useState<boolean>(true);


    const owner: Person = useMemo(() => ({
        doc: informer?.identifier || '',
        old: '',
        div: '',
        name: informer?.name || ''
    }), [informer]);

    const period: number = new Date().getFullYear();

    const service = useMemo(() => new SETService(period, owner, informer?.type || 'FISICO', expenses || [], incomes || []),
        [period, owner, informer, expenses, incomes]);

    // this effect will update all data
    useEffect(() => {
        // if we don't have data, then continue
        if (!informer && (!incomes || incomes.length === 0) && (!expenses || expenses.length === 0)) {
            setMigration(false);
            return;
        }

        // if we have data, check
        if (
            (informer && !vm.needsMigration(informer))
            && (incomes && !vm.anyNeedsMigration(incomes))
            && (expenses && !vm.anyNeedsMigration(expenses))
        ) {
            setMigration(false);
            return;
        }

        console.log(informer, incomes, expenses);
        console.log(vm.needsMigration(informer), vm.anyNeedsMigration(incomes || []), vm.anyNeedsMigration(expenses || []));
        setMigration(true);

        setTimeout(() => {
            const lInformer = informer;
            const lIncomes = incomes;
            const lExpenses = expenses;
            setInformer(vm.migrateUser(lInformer));
            if (lIncomes && vm.anyNeedsMigration(lIncomes)) setIncomes(lIncomes.map(vm.migrateIncome));
            if (lExpenses && vm.anyNeedsMigration(lExpenses)) setExpenses(lExpenses.map(vm.migrateExpense));
            setMigration(false);
        });

    }, [migration, informer, incomes, expenses, setIncomes, setInformer, setExpenses])

    function saveExpense(expense: ExpenseFormData, id?: number): { wasNew: boolean } {
        if (id) {
            setExpenses((expenses || []).map(it => {
                return it.id === id ? service.mapInvoice(expense, it) : it;
            }));
            return {wasNew: false};
        } else {
            // it's a new expense
            setExpenses([...(expenses || []), service.mapInvoice(expense)]);
            return {wasNew: true};
        }
    }

    function updateExpense(toUpdate: Expense) {
        setExpenses((expenses || []).map(it => {
            return it.id === toUpdate.id ? toUpdate : it;
        }));
    }

    function updateExpenses(expensesToUpdate: Expense[]) {
        setExpenses((expenses || []).map(it => {
            const toUpdate = expensesToUpdate.find(i => i.id === it.id);
            return toUpdate ?? it;
        }));
    }

    function addExpenses(expense: Array<ExpenseFormData>) {
        setExpenses([...(expenses || []), ...(expense.map(i => service.mapInvoice(i)))]);
    }

    async function searchRuc(ruc: string) {
        return service.findRuc(ruc)
    }

    function removeExpense(id: number) {
        setExpenses((expenses || []).filter(it => it.id !== id));
    }

    function saveIncome(income: IncomeFormData, id?: number): { wasNew: boolean } {
        if (id) {
            setIncomes((incomes || []).map(it => {
                return it.id === id ? service.mapIncome(income, id) : it;
            }));
            return {wasNew: false};
        } else {
            // it's a new
            setIncomes([...(incomes || []), service.mapIncome(income, id)]);
            return {wasNew: true};
        }
    }

    function removeIncome(id: number) {
        setIncomes((incomes || []).filter(it => it.id !== id));
    }

    function clearAllData() {
        clearExpenses();
        clearIncomes();
        clearInformer();
    }

    return {
        isMigrating: migration,

        expenses: expenses || [],
        saveExpense,
        addExpenses,
        removeExpense,

        saveIncome,
        removeIncome,

        incomes: incomes || [],
        informer: informer!,
        clearAllData,
        owner,
        period,
        searchRuc,

        updateExpense,
        updateExpenses
    }
}
