import {useLocalStorage} from '@rehooks/local-storage';
import {Egreso, Familiar, Identificacion, Informante, Ingreso} from '../set/ArandukaModel';
import {EXAMPLE_DATA} from '../set/ExampleData';
import {Person} from '../RucAPI';
import React, {useMemo, useState} from 'react';
import {Button, Drawer, message, Modal, PageHeader, Tabs} from 'antd';
import {ExpenseListPage} from './ExpenseListPage';
import {IncomeListPage} from './IncomeListPage';
import {Informer} from '../components/Informer';
import {Exporter} from './Exporter';

export function Dashboard() {

    const [informer, setInformer, clearInformer] = useLocalStorage<Informante>('informante', EXAMPLE_DATA.informante);
    const [incomes, setIncomes, clearIncomes] = useLocalStorage<Ingreso[]>('ingresos', []);
    const [expenses, setExpenses, clearExpenses] = useLocalStorage<Egreso[]>('egresos', []);
    const [identity, setIdentity, clearIdentity] = useLocalStorage<Identificacion>('identificacion', EXAMPLE_DATA.identificacion);
    const [family, setFamily, clearFamily] = useLocalStorage<Familiar[]>('familia', []);

    const [showExporter, setShowExporter] = useState(false);

    const owner: Person = useMemo(() => ({
        doc: informer?.ruc || '',
        old: '',
        div: informer?.dv || '',
        name: informer?.nombre || ''
    }), [informer]);

    const period: number = identity && identity.periodo
        ? parseInt(identity.periodo)
        : new Date().getFullYear();

    function logout() {
        Modal.warning({
            title: 'Cerrar sesión',
            content: 'Esta seguro de que desea cerrar sesión? Todos los datos no guardados se perderan',
            cancelText: 'Volver',
            okCancel: true,
            okText: 'Sí, cerrar y borrar datos',
            okType: 'danger',
            onOk: () => {
                clearFamily();
                clearIdentity();
                clearExpenses();
                clearIncomes();
                clearInformer();
                message.warning('Todos los datos han sido borrados', 10);
            }
        })
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
                                             type={informer!.tipoContribuyente}
                                             owner={owner}
                                             period={period}
                            />
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="Ingresos" key="2">
                            <IncomeListPage data={incomes!}
                                            setData={setIncomes}
                                            type={informer!.tipoContribuyente}
                                            owner={owner}
                                            period={period}
                            />
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="Familiares" key="3">
                            <pre>{JSON.stringify(family, null, 2)}</pre>
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
                <Button onClick={() => setShowExporter(false)} style={{marginRight: 8}}> Volper </Button>
            </div>}>
            <Exporter/>
        </Drawer>
    </>
}
