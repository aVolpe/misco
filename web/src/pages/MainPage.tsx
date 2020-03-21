import React, {useMemo} from 'react';
import {ExpenseListPage} from './ExpenseListPage';
import {useLocalStorage} from '@rehooks/local-storage';
import {EXAMPLE_DATA} from '../set/ExampleData';
import {Egreso, Familiar, Identificacion, Informante, Ingreso} from '../set/ArandukaModel';
import {SETExporter} from '../set/SETExporter';
import {Button, PageHeader, Tabs} from 'antd';
import {Informer} from '../components/Informer';
import {Identity} from '../components/Identity';
import {Person} from '../RucAPI';
import {IncomeListPage} from './IncomeListPage';

export function MainPage() {

    const [informer, setInformer] = useLocalStorage<Informante>('informante', EXAMPLE_DATA.informante);
    const [incomes, setIncomes] = useLocalStorage<Ingreso[]>('ingresos', EXAMPLE_DATA.ingresos);
    const [expenses, setExpenses] = useLocalStorage<Egreso[]>('egresos', []);
    const [identity, setIdentity] = useLocalStorage<Identificacion>('identificacion', EXAMPLE_DATA.identificacion);
    const [family, setFamily] = useLocalStorage<Familiar[]>('identificacion', EXAMPLE_DATA.familiares);

    const owner: Person = useMemo(() => ({
        doc: informer?.ruc || '',
        old: '',
        div: informer?.dv || '',
        name: informer?.nombre || ''
    }), [informer]);

    const period: number = useMemo(() => Number(identity?.periodo) || new Date().getFullYear(), [identity]);

    function downloadAll() {
        new SETExporter()
            .downloadData({
                ...EXAMPLE_DATA,
                egresos: expenses!
            })
    }


    return <div>
        <PageHeader ghost={false}
                    style={{border: '1px solid rgb(235, 237, 240)'}}
                    title="MISCO"
                    subTitle="Sistema suplementario para Aranduka"
                    extra={[
                        <Button key="export" onClick={downloadAll}>Exportar</Button>
                    ]}
                    footer={<Tabs defaultActiveKey="1">
                        <Tabs.TabPane tab="Egresos" key="1">
                            <ExpenseListPage data={expenses!}
                                             setData={setExpenses}
                                             type={informer!.tipoContribuyente}
                                             owner={owner}
                                             period={period}
                            />
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="Ingresos" key="2">
                            <IncomeListPage onExport={downloadAll}
                                            data={incomes!}
                                            setData={setIncomes}
                                            type={informer!.tipoContribuyente}
                                            owner={owner}
                                            period={period}
                            />
                        </Tabs.TabPane>
                    </Tabs>}
        >
            {informer && <Informer informer={informer}/>}
            {identity && <Identity identity={identity}/>}
        </PageHeader>
    </div>
}
