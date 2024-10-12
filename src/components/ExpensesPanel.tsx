import {Expense} from '../set/Model';
import React, {useEffect, useMemo, useState} from 'react';
import {useDebounce} from '../utils/Hooks';
import dayjs from 'dayjs';
import {SETListManipulatorService} from '../set/SETListManipulatorService';
import {Button, Col, DatePicker, Input, Row, Space, Switch, Table, Typography} from 'antd';
import {TableRowSelection} from 'antd/es/table/interface';
import {ExpenseDocumentType, PaymentType} from '../set/V2Enums';
import {formatMoney} from '../utils/formatters';
import {sumBy} from 'lodash';
import {MiscoTag, TagBar} from '../tags/MiscoTag';
import {SETService} from '../set/SETService';

export function ExpensePanel(props: {
    period: number;
    data: Expense[];
    doRemove: (expenseId: number) => void;
    hideActions?: boolean;
    doEdit: (expense: Expense) => void;
    onSelectionChange?: (rows: Expense[]) => void;
}) {

    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 500);
    const [date, setDate] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
        dayjs().year(props.period).startOf('year').startOf('day'),
        dayjs().year(props.period).endOf('year').endOf('day'),
    ]);
    const [data, setData] = useState<Expense[]>(props.data);
    const [tags, setTags] = useState<string[]>([]);
    const [showCopy, setShowCopy] = useState<boolean>(false);

    useEffect(() => {
        setData(new SETListManipulatorService().filterExpenses(props.data, debouncedQuery, date[0], date[1], tags))
    }, [debouncedQuery, props.data, date, tags]);

    const selection: TableRowSelection<Expense> | undefined = useMemo(() => {
        if (!props.onSelectionChange) return undefined;
        return {
            type: 'checkbox',
            onChange: (selectedRowKeys: React.Key[], selectedRows: Expense[]) => {
                console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
                props.onSelectionChange!(selectedRows);
            },
        };
    }, [props.onSelectionChange]);

    function goNextMonth() {
        setDate(d => [
            d[0].startOf('month').add(1, 'month').startOf('month'),
            d[0].startOf('month').add(1, 'month').endOf('month'),
        ]);
    }

    function goPrevMonth() {
        setDate(d => [
            d[0].startOf('month').subtract(1, 'month').startOf('month'),
            d[0].startOf('month').subtract(1, 'month').endOf('month'),
        ]);
    }

    function onQueryKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.altKey && ['d', 'ð'].includes(e.key)) {
            e.preventDefault();
            setQuery('');
        }
    }

    return <>
        <Row gutter={[8, 8]} align="middle">
            <Col span={2} style={{textAlign: 'right', fontWeight: 'bold'}} offset={1}>
                Búsqueda:
            </Col>
            <Col span={9}>
                <Input placeholder="Por ruc/nombre/nro factura"
                       value={query}
                       allowClear
                       style={{width: '100%'}}
                       onKeyDown={onQueryKeyDown}
                       onChange={e => setQuery(e.target.value)}/>
                <TagBar onChanged={setTags}/>
            </Col>
            <Col span={2} style={{textAlign: 'right', fontWeight: 'bold'}}>
                Rango:
            </Col>
            <Col span={9}>
                <DatePicker.RangePicker value={date}
                                        style={{width: '100%'}}
                                        allowClear={false}
                                        presets={[{
                                            label: new Date().getFullYear() - 2,
                                            value: [
                                                dayjs().subtract(2, 'year').startOf('year'),
                                                dayjs().subtract(2, 'year').endOf('year'),
                                            ]
                                        }, {
                                            label: new Date().getFullYear() - 1,
                                            value: [
                                                dayjs().subtract(1, 'year').startOf('year'),
                                                dayjs().subtract(1, 'year').endOf('year'),
                                            ]
                                        }, {
                                            label: new Date().getFullYear(),
                                            value: [
                                                dayjs().startOf('year'),
                                                dayjs().endOf('year'),
                                            ],
                                        }]}
                                        renderExtraFooter={() => <Space.Compact block style={{
                                            justifyContent: 'center',
                                            padding: 2
                                        }}>
                                            <Button onClick={goPrevMonth}>Mes ant.</Button>
                                            <Button onClick={goNextMonth}>Mes sgte.</Button>
                                        </Space.Compact>}
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
            <ExpenseTable invoices={data}
                          selection={selection}
                          hideActions={props.hideActions}
                          showCopy={showCopy}
                          onRemove={r => props.doRemove(r.id)}
                          onEdit={props.doEdit}/>
        </Row>
        <Row style={{paddingTop: 5}}>
            <Col>
                Mostrar copiar: <Switch checkedChildren="Sí" unCheckedChildren="No" onChange={setShowCopy}/>
            </Col>
        </Row>
    </>
}

function ExpenseTable(props: {
    invoices: Expense[]
    onEdit(row: Expense): void;
    onRemove(row: Expense): void;
    showCopy: boolean;
    selection?: TableRowSelection<Expense>;
    hideActions?: boolean;
}) {

    const [pagination, setPagination] = useState<{ page: number, pageSize: number }>({page: 1, pageSize: 10});

    return <Table<Expense>
        dataSource={props.invoices}
        size="small"
        rowSelection={props.selection}
        pagination={{
            pageSizeOptions: [10, 20, 30, 100],
            pageSize: pagination.pageSize,
            onChange: (p, ps) => setPagination({page: p, pageSize: ps}),
            showTotal: (t, r) => `Mostrando ${r[0]} a ${r[1]} de ${t} registros.`
        }}
        rowKey="id"
        style={{width: '100%'}}
        columns={[{
            title: 'ID',
            dataIndex: 'id',
            defaultSortOrder: 'descend',
            sorter: (a, b) => a.id - b.id,
            render: (_, row) => <Space direction="vertical">
                {row.id}
                <MiscoTag tags={row.tags}/>
            </Space>
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
            render: (d) => <Typography.Text
                copyable={props.showCopy && {text: SETService.mapLocalToMoment(d).format("DD/MM/YYYY")}}>{d}</Typography.Text>
        }, {
            title: 'Emisor',
            dataIndex: 'identifier',
            align: 'left',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (_, row) => <>
                {row.name} (<Typography.Text copyable={props.showCopy}>{row.identifier}</Typography.Text>)
            </>
        }, {
            title: 'Factura',
            dataIndex: 'voucher',
            align: 'right',
            render: (_, row) => <>
                <Typography.Text copyable={props.showCopy}>{row.voucher}</Typography.Text>
                <br/><Typography.Text copyable={props.showCopy}>{row.letterhead}</Typography.Text>
            </>
        }, {
            title: 'Monto',
            align: 'right',
            dataIndex: 'amount',
            render: (a: number) => <Typography.Text
                copyable={props.showCopy && {text: a.toString()}}>{formatMoney(a)}</Typography.Text>,
            sorter: (a, b) => a.amount - b.amount,
        }, props.hideActions === true ? {} : {
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
                    <Typography.Text copyable={{text: sum.toString()}}>{formatMoney(sum)}</Typography.Text>
                </td>
                <td/>
            </tr>
        }}
    />

}
