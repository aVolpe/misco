import React, {useState} from 'react';
import {Button, Drawer, message, Modal, Result, Tabs} from 'antd';
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
import {BasePage} from '../components/BasePage';
import {MarangatuConflictHelper} from './MarangatuConfilctHelper';
import { SETService } from '../set/SETService';
import { SETListManipulatorService } from '../set/SETListManipulatorService';
import { Expense } from '../set/Model';


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

    async function saveImportedInvoice(toImport: ParseWithTags) {
        const toAdd: ExpenseFormData[] = []
        for (const data of toImport.parsed) {
            if (!data.ruc) return;
            try {
                const owner = data.owner
                    ? data.owner
                    : await state.searchRuc(data.ruc);

                const mapped = mapToExpense(data, owner);
                mapped.tags = toImport.tags;
                toAdd.push(mapped)
                message.info(`Factura ${data.identifier} de ${owner.name} importada`);
            } catch (e) {
                message.warning(`No se encuentra el ruc ${data.ruc}`);
            }
        }
        state.addExpenses(toAdd);
        setClipboardImporter(false);
    }
    
    async function saveExpense(expense: ExpenseFormData, id?: number): Promise<{wasNew: boolean}> {
        const checks = !id && checkCommonMistakesOnNewInvoice(expense, state.expenses, new SETListManipulatorService());
        if (!checks) { return state.saveExpense(expense, id); }
        
        const { reason, expense: expenseToReplace } = checks;
        
        return new Promise((resolve, reject) => {
            Modal.warning({
                title: reason,
                content: `Esta seguro de que desea guardar de todos modos? La factura ${expenseToReplace.voucher} contiene coincidencias`,
                cancelText: 'No',
                okCancel: true,
                okText: 'Guardar',
                okType: 'danger',
                onOk: () => {
                    resolve(state.saveExpense(expense, id));
                },
                onCancel: () => {
                    reject();
                }
            });
        });
    }

    if (state.isMigrating) {
        return <Result title="Cargando">
            Migrando datos a versión actual, por favor espere...
        </Result>
    }

    return <>
        <BasePage title="MISCO"
                  subTitle="Sistema suplementario para Marangatu"
                  extra={[
                      <Button key="import" onClick={() => setClipboardImporter(true)}>Importar</Button>,
                      <Button key="export" onClick={() => setShowExporter(true)}>Exportar</Button>,
                      <Button key="clear" type="primary" danger onClick={logout}>Cerrar sesión</Button>
                  ]}
                  footer={<Tabs defaultActiveKey="1">
                      <Tabs.TabPane tab="Egresos" key="1">
                          <ExpenseListPage data={state.expenses}
                                           onSave={saveExpense}
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
                      <Tabs.TabPane tab="Conflictos con marangatu" key="4">
                          <MarangatuConflictHelper/>
                      </Tabs.TabPane>
                  </Tabs>}
        > {state.informer && <Informer informer={state.informer}/>} </BasePage>
        <Drawer
            title="Exportar datos"
            width={720}
            onClose={() => setShowExporter(false)}
            open={showExporter}
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

type ParseWithTags = {
    tags: string[],
    parsed: Array<Partial<ParseResult>>
}
function ClipboardImporterModal(props: {
    visible: boolean,
    onCancel: () => void,
    onOk: (v: ParseWithTags) => void
}) {
    const [parsed, setParsed] = useState<ParseWithTags>()

    return <Modal open={props.visible}
                  okText="Importar"
                  onCancel={() => props.onCancel()}
                  okButtonProps={{disabled: !parsed}}
                  onOk={() => parsed && props.onOk(parsed)}
    >
        <ClipboardImporter onNewParsed={(p, t) => setParsed({parsed: p, tags: t})}/>
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

function checkCommonMistakesOnNewInvoice(data: ExpenseFormData, 
    expenses: Expense[],
    service: SETListManipulatorService): { reason: string, expense: Expense } | undefined {

    const checkDigital = service.findLastByIdentifier(data.owner.doc, expenses, []);
    if (checkDigital.expense && checkDigital.expense?.tags?.includes('ELECTRONIC_INVOICE')) {
        return { reason: 'has_electronic_invoices', expense: checkDigital.expense };
    }

    const checkDup = service.findByInvoiceNumber(data.expenseNumber!, data.owner.doc, expenses, []);
    if (checkDup.expense) {
        return { reason: 'has_same_invoice', expense: checkDup.expense };
    }

}