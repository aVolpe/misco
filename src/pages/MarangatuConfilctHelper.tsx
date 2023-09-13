import React, {useMemo, useState} from 'react';
import {App, Button, Collapse, Modal, Select} from 'antd';
import {useLocalStorage} from '@rehooks/local-storage';
import {Expense} from '../set/Model';
import {JsonTable} from '../components/JsonTable';
import {ExpensePanel} from '../components/ExpensesPanel';
import {AS_OPTIONS} from '../tags/Model';
import {useMiscoState} from '../misco';
import {uniq} from 'lodash';

type MarangatuTypes = 'COMPRA' | 'VENTA' | 'INGERESO' | 'EGRESO';

type COLUMN_NAMES =
    "RUC / Número de Identificación del Informado" |
    "Nombre o Razón Social del Informado" |
    "Tipo de Registro" |
    "Tipo de Comprobante" |
    "Fecha de Emisión" |
    "Periodo" |
    "Número de Comprobante" |
    "Estado del Comprobante" |
    "Total Comprobante";


interface ExportedData {
    "Datos": Array<Record<COLUMN_NAMES, string>>
}

export function MarangatuConflictHelper() {

    const [open, setOpen] = useState(false);
    const [expenses] = useLocalStorage<Expense[]>('egresos', []);
    const [imported, setImported] = useState<ExportedData>();

    const onOk = (d: ExportedData) => {
        console.log(d);
        setOpen(false);
        setImported(d);
    }

    return (
        <div>
            <h1>MarangatuConflictHelper</h1>
            <Button onClick={() => setOpen(true)}>Importar</Button>
            <MarangatuExcelImporter open={open} onOk={onOk} onCancel={() => setOpen(false)}/>
            {imported && <ConflictResolver data={imported} source={expenses}/>}
        </div>
    )
}


function ConflictResolver({data, source}: {
    data: ExportedData,
    source: Array<Expense>
}) {

    const diff = useMemo(() => calculateDiff(data, source), [data, source]);

    return <div>

        <h1>ConflictResolver</h1>
        <ul>
            <li>Cantidad de filas importadas: {data.Datos.length}</li>
            <li>Cantidad de filas en fuente: {source.length}</li>
            <li>
                Cantidad de filas diferentes:
                <ul>
                    <li>En fuente {diff.notInSource.length}</li>
                    <li>En importado {diff.notInImported.length}</li>
                    <li>En ambos {diff.inSourceAndInImported.length}</li>
                </ul>
            </li>
        </ul>
        <div>
            <Collapse defaultActiveKey={['1']}>
                <Collapse.Panel header="No encontrados en 'datos locales'" key="NOT_IN_LOCAL">
                    <ImportedTable data={diff.notInImported}/>
                </Collapse.Panel>
                <Collapse.Panel header="No encontrados en 'importados'" key="NOT_IN_IMPORTED">
                    <ExpenseTaggeablePannel data={diff.notInSource}/>
                </Collapse.Panel>
                <Collapse.Panel header="Encontrados en 'importados'" key="IN_BOTH">
                    <ExpenseTaggeablePannel data={diff.inSourceAndInImported}/>
                </Collapse.Panel>
            </Collapse>
        </div>
    </div>
}

function Tagger(props: {
    data: Expense[],
    onCancel: () => void
    open: boolean
}) {

    const [tags, setTags] = useState<string[]>([]);
    const state = useMiscoState();
    const {message} = App.useApp();

    function onOk() {
        state.updateExpenses(props.data.map(e => ({
            ...e,
            tags: uniq([...(e.tags || []), ...tags])
        })))
        message.success('Tags agregados', 5);
        props.onCancel();
    }

    return <Modal open={props.open}
                  onOk={onOk}
                  onCancel={props.onCancel}
                  okButtonProps={{disabled: tags.length === 0}}>
        <h1>Filas a tagear:</h1>
        <JsonTable rowKey="id" data={props.data}/>
        <hr/>
        Tag a aplicar:
        <Select
            mode="multiple"
            allowClear
            style={{width: '100%'}}
            placeholder="Please select"
            onChange={setTags}
            options={AS_OPTIONS}
        />
        <hr/>
        <h2>Resumen</h2>
        <span>Se aplicaran los tags {tags.join(",")} a {props.data.length} registros</span>
    </Modal>
}

function MarangatuExcelImporter(props: {
    open: boolean,
    onOk: (d: ExportedData) => void,
    onCancel: () => void
}) {

    // TODO usar https://docs.sheetjs.com/ para importar el xlsx directo
    const [data, setData] = useState<ExportedData>();

    return <Modal open={props.open}
                  onCancel={props.onCancel}
                  onOk={() => props.onOk(data!)} okButtonProps={{disabled: !data}}>
        <div>
            <h1>Importar datos desde marangatu</h1>
            <textarea value={JSON.stringify(data)}
                      onChange={e => setData(JSON.parse(e.target.value))}/>
            <div>
                Cantidad de filas a importar: {data?.Datos.length}
            </div>
        </div>
    </Modal>
}

function calculateDiff(data: ExportedData, source: Array<Expense>): {
    notInSource: Expense[],
    notInImported: Array<Record<COLUMN_NAMES, string>>,
    inSourceAndInImported: Expense[]
} {
    const notInSource = source.filter(e => {
        const found = data.Datos.find(d => {
            if (e.type === 'ips' && d["Tipo de Comprobante"] === "EXTRACTO DE CUENTA IPS")
                return parseInt(d["Total Comprobante"]) === e.amount;
            return d["Número de Comprobante"] === e.voucher;
        });
        return !found;
    });
    const inSourceAndInImported = source.filter(e => {
        return data.Datos.find(d => {
            if (e.type === 'ips' && d["Tipo de Comprobante"] === "EXTRACTO DE CUENTA IPS")
                return parseInt(d["Total Comprobante"]) === e.amount;
            return d["Número de Comprobante"] === e.voucher;
        });
    });
    const notInImported = data.Datos.filter(e => {
        const found = source.find(d => {
            if (d.type === 'ips' && e["Tipo de Comprobante"] === "EXTRACTO DE CUENTA IPS")
                return parseInt(e["Total Comprobante"]) === d.amount;
            return d.voucher == e["Número de Comprobante"];
        });
        return !found;
    });
    return {notInSource, notInImported, inSourceAndInImported};
}

function ImportedTable(props: { data: Array<Record<COLUMN_NAMES, string>> }) {
    return <JsonTable rowKey="Número de Comprobante"
                      data={props.data}/>;
}

function ExpenseTaggeablePannel(props: {
    data: Array<Expense>
}) {

    const [period, setPeriod] = useState<number>(new Date().getFullYear() - 1);
    const [selected, setSelection] = useState<Array<Expense>>([]);
    const [taggerOpen, setTaggerOpen] = useState(false);

    return <>
        <Tagger data={selected}
                onCancel={() => setTaggerOpen(false)}
                open={taggerOpen}/>
        <Button disabled={selected.length === 0}
                onClick={() => setTaggerOpen(true)}>
            Agregar tag a {selected.length} items
        </Button>
        <ExpensePanel data={props.data}
                      period={period}
                      onSelectionChange={setSelection}
                      hideActions={true}
                      doRemove={() => console.log('noop')}
                      doEdit={() => console.log('noop')}

        />;
    </>;
}
