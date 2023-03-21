import {useLocalStorage} from '@rehooks/local-storage';
import {Expense, Income, User} from './set/Model';
import {useEffect, useMemo, useState} from 'react';
import {VersionMigrator} from './set/VersionMigrator';
import {Person} from './RucAPI';
import {ExpenseFormData} from './components/ExpenseForm';
import {SETService} from './set/SETService';
import {IncomeFormData} from './components/IncomeForm';


const vm = new VersionMigrator();

/**
 * Handles all the state of the site, currently it can be only used one time (for the migration flag)
 */
export function useMiscoState() {

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
                return it.id === id ? service.mapInvoice(expense, id) : it;
            }));
            return {wasNew: false};
        } else {
            // it's a new
            setExpenses([...(expenses || []), service.mapInvoice(expense)]);
            return {wasNew: true};
        }
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
        informer: informer,
        clearAllData,
        owner,
        period,
        searchRuc
    }
}
