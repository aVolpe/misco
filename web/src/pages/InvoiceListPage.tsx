import React, {useCallback, useMemo, useState} from 'react';
import {Button, Col, Row, Table} from 'antd';
import {Async, NRHelper, NRWrapper} from '../Model';
import {Help} from '../components/Help';
import {Person, query} from '../RucAPI';
import {InvoiceForm, InvoiceFormData} from '../components/InvoiceEditorComponent';
import {EXAMPLE_DATA} from '../set/ExampleData';
import {SETService} from '../logic/SETService';
import {Egreso} from '../set/ArandukaModel';
import {formatMoney} from '../utils/formatters';
import {useLocalStorage} from '@rehooks/local-storage';


const defaultInvoice: InvoiceFormData = {
    date: '',
    letterhead: '',
    invoiceNumber: '',
    type: ['gasto', 'GPERS'],
    owner: {old: '', div: '', name: '', doc: ''},
    amount: 0
};

export function InvoiceListPage() {

    const [current, setCurrent] = useState<InvoiceFormData>();
    const [data, setData] = useLocalStorage('egresos', EXAMPLE_DATA.egresos as Egreso[]);
    const service = useMemo(() => new SETService(
        Number(EXAMPLE_DATA.identificacion.periodo),
        {
            doc: EXAMPLE_DATA.informante.ruc,
            name: EXAMPLE_DATA.informante.nombre,
            div: EXAMPLE_DATA.informante.dv,
            old: ''
        },
        'FISICO',
        data!
    ), [data]);

    function onNewInvoice() {
        setCurrent(JSON.parse(JSON.stringify((defaultInvoice))));
    }


    return <Row gutter={[8, 8]} style={{padding: 8}}>
        <Col span={18}>
            <Row>
                Filtros (texto y mes)
            </Row>
            <Row>
                <InvoiceTable invoices={data!} onEdit={r => setCurrent(service.mapToForm(r))}/>
            </Row>
        </Col>
        <Col span={6}>
            {current
                ? <InvoiceEditor current={current}
                                 onCancel={() => setCurrent(undefined)}
                                 onNew={d => {
                                     console.log('new data', d);
                                     setData([...data!, service.mapInvoice(d)]);
                                     onNewInvoice();
                                 }}/>
                : <Help onNewInvoice={onNewInvoice}/>
            }
        </Col>
    </Row>
}

function InvoiceEditor(props: {
    current: InvoiceFormData;
    onNew: (n: InvoiceFormData) => void;
    onCancel: () => void;
}) {

    const [owner, setOwner] = useState<Async<Person>>(NRHelper.loaded(props.current.owner));

    const onNewRuc = useCallback((ruc: string) => {
        if (ruc === NRWrapper.of(owner).map(o => o?.doc).orElse('')) {
            return;
        }
        query(ruc)
            .then(r => setOwner(NRHelper.loaded(r[0])))
            .catch(e => NRHelper.error(e));
    }, [owner]);

    return <>
        <InvoiceForm owner={owner}
                     onSubmit={data => {
                         props.onNew(data);
                         return true;
                     }}
                     onCancel={props.onCancel}
                     invoice={props.current}
                     onNewRuc={onNewRuc}/>
    </>
}

function InvoiceTable(props: {
    invoices: Egreso[]
    onEdit(row: Egreso): void;
}) {
    return <Table<Egreso>
        dataSource={props.invoices}
        rowKey="id"
        style={{width: '100%'}}
        columns={[
            {title: 'ID', dataIndex: 'id'},
            {
                title: 'Emisor',
                dataIndex: 'relacionadoNombres',
                render: (_, row) => `${row.relacionadoNumeroIdentificacion} ${row.relacionadoTipoIdentificacion}`
            },
            {title: 'Razón social', dataIndex: 'relacionadoNombres'},
            {title: 'Fecha', dataIndex: 'fecha'},
            {title: 'Monto', dataIndex: 'egresoMontoTotal', render: (a: number) => formatMoney(a)},
            {
                title: 'Acciones', dataIndex: '', render: (_, row) => {
                    return <Button onClick={() => props.onEdit(row)}>Editar</Button>
                }
            }

        ]}
    />

}
