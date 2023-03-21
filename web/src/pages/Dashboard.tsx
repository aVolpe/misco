import React, {useState} from 'react';
import {Button, Drawer, message, Modal, PageHeader, Result, Tabs} from 'antd';
import {ExpenseListPage} from './ExpenseListPage';
import {IncomeListPage} from './IncomeListPage';
import {Informer} from '../components/Informer';
import {Exporter} from './Exporter';
import {ClipboardImporter} from './ClipboardImporter';
import {ParseResult} from '../import_parsers/ClipboardParser';
import {useMiscoState} from '../misco';
import {ExpenseFormData} from '../components/ExpenseForm';
import {Person} from '../RucAPI';
import {DuplicateHelper} from './DuplicateHelper';


export function Dashboard() {


    const state = useMiscoState();
    const [clipboardImporter, setClipboardImporter] = useState<boolean>(false);
    const [showExporter, setShowExporter] = useState(false);


    function logout() {
        Modal.warning({
            title: 'Cerrar sesión',
            content: 'Esta seguro de que desea cerrar sesión? Todos los datos no guardados se perderan',
            cancelText: 'Volver',
            okCancel: true,
            okText: 'Sí, cerrar y borrar datos',
            okType: 'danger',
            onOk: () => {
                state.clearAllData();
                message.warning('Todos los datos han sido borrados', 10);
            }
        })
    }

    async function saveImportedInvoice(toImport: Array<Partial<ParseResult>>) {
        const toAdd : ExpenseFormData[] = []
        for (const data of toImport) {
            if (!data.ruc) return;
            try {
                const owner = data.owner
                    ? data.owner
                    : await state.searchRuc(data.ruc);

                toAdd.push(mapToExpense(data, owner))
                message.info(`Factura ${data.identifier} de ${owner.name} importada`);
            } catch (e) {
                message.warning(`No se encuentra el ruc ${data.ruc}`);
            }
        }
        state.addExpenses(toAdd);
        setClipboardImporter(false);
    }

    if (state.isMigrating) {
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
                        <Button key="import" onClick={() => setClipboardImporter(true)}>Importar</Button>,
                        <Button key="export" onClick={() => setShowExporter(true)}>Exportar</Button>,
                        <Button key="clear" type="danger" onClick={logout}>Cerrar sesión</Button>
                    ]}
                    footer={<Tabs defaultActiveKey="1">
                        <Tabs.TabPane tab="Egresos" key="1">
                            <ExpenseListPage data={state.expenses}
                                             onSave={state.saveExpense}
                                             doRemove={state.removeExpense}
                                             type={state.informer?.type || 'FISICO'}
                                             owner={state.owner}
                                             period={state.period}
                            />
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="Ingresos" key="2">
                            <IncomeListPage data={state.incomes}
                                            onSave={state.saveIncome}
                                            doRemove={state.removeIncome}
                                            type={state.informer?.type || 'FISICO'}
                                            owner={state.owner}
                                            period={state.period}
                            />
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="Egresos duplicados" key="3">
                            <DuplicateHelper expenses={state.expenses} onRemove={state.removeExpense}/>
                        </Tabs.TabPane>
                    </Tabs>}
        > {state.informer && <Informer informer={state.informer}/>} </PageHeader>
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
        <ClipboardImporterModal visible={clipboardImporter}
                                onOk={saveImportedInvoice}
                                onCancel={() => setClipboardImporter(false)}/>
    </>
}

function ClipboardImporterModal(props: { visible: boolean, onCancel: () => void, onOk: (v: Array<Partial<ParseResult>>) => void }) {
    const [parsed, setParsed] = useState<Array<Partial<ParseResult>>>()

    return <Modal visible={props.visible} okText="Importar"
                  onCancel={() => props.onCancel()}
                  okButtonProps={{disabled: !parsed}}
                  onOk={() => parsed && props.onOk(parsed)}
    >
        <ClipboardImporter onNewParsed={p => setParsed(p)}/>
    </Modal>
}

function mapToExpense(p: Partial<ParseResult>, owner: Person): ExpenseFormData {
    return {
        date: p.date!,
        type: p.type!,
        amount: p.total!,
        letterhead: p.letterhead + "",
        expenseNumber: p.identifier!,
        isCredit: p.condition !== 'cash',
        owner: owner
    };
}
