import {useLocalStorage} from '@rehooks/local-storage';
import {Person} from '../RucAPI';
import React, {useEffect, useMemo, useState} from 'react';
import {Button, Drawer, message, Modal, PageHeader, Result, Tabs} from 'antd';
import {ExpenseListPage} from './ExpenseListPage';
import {IncomeListPage} from './IncomeListPage';
import {Informer} from '../components/Informer';
import {Exporter} from './Exporter';
import {VersionMigrator} from "../set/VersionMigrator";
import {Expense, Income, User} from "../set/Model";

const vm = new VersionMigrator();

export function Dashboard() {

    const [informer, setInformer, clearInformer] = useLocalStorage<User>('informante');
    const [incomes, setIncomes, clearIncomes] = useLocalStorage<Income[]>('ingresos', []);
    const [expenses, setExpenses, clearExpenses] = useLocalStorage<Expense[]>('egresos', []);
    const [migration, setMigration] = useState<boolean>(true);

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

    const [showExporter, setShowExporter] = useState(false);

    const owner: Person = useMemo(() => ({
        doc: informer?.identifier || '',
        old: '',
        div: '',
        name: informer?.name || ''
    }), [informer]);

    const period: number = new Date().getFullYear();

    function logout() {
        Modal.warning({
            title: 'Cerrar sesión',
            content: 'Esta seguro de que desea cerrar sesión? Todos los datos no guardados se perderan',
            cancelText: 'Volver',
            okCancel: true,
            okText: 'Sí, cerrar y borrar datos',
            okType: 'danger',
            onOk: () => {
                clearExpenses();
                clearIncomes();
                clearInformer();
                message.warning('Todos los datos han sido borrados', 10);
            }
        })
    }

    if (migration) {
        return <Result title="Cargando">
            Migrando datos a versión actual, por favor espere...
        </Result>
    }

    return <>
        <PageHeader ghost={false}
                    style={{border: '1px solid rgb(235, 237, 240)'}}
                    title="MISCO"
                    subTitle="Sistema suplementario para Aranduka"
                    extra={[
                        <Button key="export" onClick={() => setShowExporter(true)}>Exportar</Button>,
                        <Button key="clear" type="danger" onClick={logout}>Cerrar sesión</Button>
                    ]}
                    footer={<Tabs defaultActiveKey="1">
                        <Tabs.TabPane tab="Egresos" key="1">
                            <ExpenseListPage data={expenses!}
                                             setData={setExpenses}
                                             type={informer!.type}
                                             owner={owner}
                                             period={period}
                            />
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="Ingresos" key="2">
                            <IncomeListPage data={incomes!}
                                            setData={setIncomes}
                                            type={informer!.type}
                                            owner={owner}
                                            period={period}
                            />
                        </Tabs.TabPane>
                    </Tabs>}
        > {informer && <Informer informer={informer}/>} </PageHeader>
        <Drawer
            title="Exportar datos"
            width={720}
            onClose={() => setShowExporter(false)}
            visible={showExporter}
            bodyStyle={{paddingBottom: 80}}
            footer={<div style={{textAlign: 'right'}}>
                <Button onClick={() => setShowExporter(false)} style={{marginRight: 8}}> Volver </Button>
            </div>}>
            <Exporter/>
        </Drawer>
    </>
}
