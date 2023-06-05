import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Button, Col, DatePicker, Input, message, Row, Table, Typography} from 'antd';
import {Async, NRHelper, NRWrapper} from '../Model';
import {Help} from '../components/Help';
import {Person} from '../RucAPI';
import {ExpenseForm, ExpenseFormData} from '../components/ExpenseForm';
import {formatMoney} from '../utils/formatters';
import {GlobalHotKeys} from 'react-hotkeys';
import {PersonWithLetterhead, SETService} from '../set/SETService';
import {useDebounce} from '../utils/Hooks';
import {SETListManipulatorService} from '../set/SETListManipulatorService';
import {sumBy} from 'lodash';
import {Expense} from "../set/Model";
import {PersonType} from "../set/ParametroEgreso";
import {ExpenseDocumentType, PaymentType} from "../set/V2Enums";
import dayjs from 'dayjs';

export const emptyOwner: Person = {old: '', div: '', name: '', doc: ''};

const defaultExpense: ExpenseFormData = {
    date: '',
    letterhead: '',
    expenseNumber: '',
    type: "invoice",
    owner: emptyOwner,
    amount: 0,
    isCredit: false
};

export function ExpenseListPage(props: {
    data: Expense[];
    onSave: (expense: ExpenseFormData, id?: number) => { wasNew: boolean };
    doRemove: (expenseId: number) => void;
    owner: Person;
    type: PersonType;
    period: number;
}) {

    const [current, setCurrent] = useState<ExpenseFormData>();
    const [currentId, setCurrentId] = useState<number>();
    const service = useMemo(() => new SETService(props.period, props.owner, props.type, props.data),
        [props.data, props.period, props.type, props.owner]);

    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 500);
    const [date, setDate] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
        dayjs().year(props.period).startOf('year').startOf('day'),
        dayjs().year(props.period).endOf('year').endOf('day'),
    ]);
    const [data, setData] = useState<Expense[]>(props.data);

    useEffect(() => {
        setData(new SETListManipulatorService().filterExpenses(props.data, debouncedQuery, date[0], date[1]))
    }, [debouncedQuery, props.data, date]);

    function onNewExpense() {
        setCurrent(JSON.parse(JSON.stringify((defaultExpense))));
        setCurrentId(undefined);
    }

    function onSave(d: ExpenseFormData) {
        if (props.onSave(d, currentId).wasNew) {
            message.info(`Factura ${d.expenseNumber} guardada`, 5);
            onNewExpense();
        } else {
            message.info("Registro actualizado", 5);
            setCurrentId(undefined);
            setCurrent(undefined);
        }
    }

    function onEdit(d: Expense) {
        setCurrentId(d.id);
        setCurrent(service.mapToForm(d));
    }

    const keyMap = {
        ADD_INVOICE: ["Control+i"],
    };

    return <GlobalHotKeys
        keyMap={keyMap}
        handlers={{
            ADD_INVOICE: onNewExpense
        }}>
        <Row gutter={[8, 8]} style={{padding: 8}}>
            <Col span={18}>
                <Row gutter={[8, 8]} align="middle">
                    <Col span={2} style={{textAlign: 'right', fontWeight: 'bold'}} offset={1}>
                        Búsqueda:
                    </Col>
                    <Col span={9}>
                        <Input placeholder="Por ruc/nombre/nro factura"
                               value={query}
                               onChange={t => setQuery(t.target.value)}/>
                    </Col>
                    <Col span={2} style={{textAlign: 'right', fontWeight: 'bold'}}>
                        Rango:
                    </Col>
                    <Col span={9}>
                        <DatePicker.RangePicker value={date}
                                                style={{width: '100%'}}
                                                allowClear={false}
                                                ranges={{
                                                    [new Date().getFullYear() - 2]: [
                                                        dayjs().subtract(2, 'year').startOf('year'),
                                                        dayjs().subtract(2, 'year').endOf('year'),
                                                    ],
                                                    [new Date().getFullYear() - 1]: [
                                                        dayjs().subtract(1, 'year').startOf('year'),
                                                        dayjs().subtract(1, 'year').endOf('year'),
                                                    ],
                                                    [new Date().getFullYear()]: [
                                                        dayjs().startOf('year'),
                                                        dayjs().endOf('year')
                                                    ]
                                                }}
                                                onChange={values => {
                                                    if (!values) return;
                                                    setDate([
                                                        values[0]!.startOf('day'),
                                                        values[1]!.endOf('day')
                                                    ]);
                                                }}
                        />
                    </Col>
                </Row>
                <Row style={{paddingTop: 5}}>
                    <InvoiceTable invoices={data}
                                  onRemove={r => props.doRemove(r.id)}
                                  onEdit={onEdit}/>
                </Row>
            </Col>
            <Col span={6} style={{border: '1px solid rgb(235, 237, 240)'}}>
                {current
                    ? <InvoiceEditor current={current}
                                     service={service}
                                     onCancel={() => setCurrent(undefined)}
                                     editType={currentId ? 'EDIT' : 'NEW'}
                                     onSave={onSave}/>
                    : <Help onNewInvoice={onNewExpense} type="invoice"/>
                }
            </Col>
        </Row>
    </GlobalHotKeys>
}

function InvoiceEditor(props: {
    editType: 'NEW' | 'EDIT';
    current: ExpenseFormData;
    onSave: (n: ExpenseFormData) => void;
    onCancel: () => void;
    service: SETService
}) {

    const [owner, setOwner] = useState<Async<PersonWithLetterhead>>(NRHelper.loaded(props.current.owner));
    const toEdit = props.current;

    const onNewRuc = useCallback((ruc: string) => {
        if (ruc === NRWrapper.of(owner).map(o => o?.doc).orElse('')) {
            return;
        }
        props.service.findRuc(ruc)
            .then(r => setOwner(NRHelper.loaded(r)))
            .catch(e => NRHelper.error(e));
    }, [owner, props.service]);

    useEffect(() => {
        if (toEdit.owner)
            setOwner(NRHelper.loaded(toEdit.owner))

    }, [toEdit]);


    return <ExpenseForm owner={owner}
                        editType={props.editType}
                        onSubmit={ev => {
                            setOwner(NRHelper.loaded(emptyOwner));
                            props.onSave(ev);
                        }}
                        onCancel={props.onCancel}
                        expense={props.current}
                        onNewRuc={onNewRuc}/>;
}

function InvoiceTable(props: {
    invoices: Expense[]
    onEdit(row: Expense): void;
    onRemove(row: Expense): void;
}) {
    return <Table<Expense>
        dataSource={props.invoices}
        size="small"
        pagination={{
            pageSize: 10,
            showTotal: (t, r) => `Mostrando ${r[0]} a ${r[1]} de ${t} registros.`
        }}
        rowKey="id"
        style={{width: '100%'}}
        columns={[{
            title: 'ID',
            dataIndex: 'id',
            defaultSortOrder: 'descend',
            sorter: (a, b) => a.id - b.id,
        }, {
            title: 'Tipo',
            dataIndex: 'type',
            align: 'right',
            render: (_, row) => <>
                {ExpenseDocumentType[row.type]}
                {row.paymentType && <><br/> <small>{PaymentType[row.paymentType]}</small></>}
            </>,
            sorter: (a, b) => `${ExpenseDocumentType[a.type]}`
                .localeCompare(`${ExpenseDocumentType[b.type]}`),
        }, {
            title: 'Fecha',
            dataIndex: 'date',
            sorter: (a, b) => a.date.localeCompare(b.date),
        }, {
            title: 'Emisor',
            dataIndex: 'identifier',
            align: 'left',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (_, row) => <>
                {row.name} ({row.identifier})
            </>
        }, {
            title: 'Factura',
            dataIndex: 'voucher',
            align: 'right',
            render: (_, row) => <>
                {row.voucher}
                <br/><small>{row.letterhead}</small>
            </>
        }, {
            title: 'Monto',
            align: 'right',
            dataIndex: 'amount',
            render: (a: number) => formatMoney(a),
            sorter: (a, b) => a.amount - b.amount,
        }, {
            title: 'Acciones', dataIndex: '', render: (_, row) => {
                return <>
                    <Button onClick={() => props.onEdit(row)}>Editar</Button>
                    <Button danger onClick={() => props.onRemove(row)}>Eliminar</Button>
                </>
            }
        }]}

        summary={() => {
            const sum = sumBy(props.invoices, 'amount');
            return <tr>
                <th colSpan={3}>Total (todas las filas)</th>
                <td colSpan={2}/>
                <td className="ant-table-cell" style={{textAlign: 'right', padding: 8}}>
                    <Typography.Text>{formatMoney(sum)}</Typography.Text>
                </td>
                <td/>
            </tr>
        }}
    />

}
