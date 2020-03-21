import React, {useEffect, useState} from 'react';
import {Button, Col, DatePicker, Input, Row, Table} from 'antd';
import {Person} from '../RucAPI';
import {Ingreso} from '../set/ArandukaModel';
import {formatMoney} from '../utils/formatters';
import {SETService} from '../set/SETService';
import {PersonType} from '../set/ParametroEgreso';
import {useDebounce} from '../utils/Hooks';
import moment from 'moment';
import {SETListManipulatorService} from '../set/SETListManipulatorService';

export function IncomeListPage(props: {
    onExport: () => void;
    data: Ingreso[];
    setData: (newData: Ingreso[]) => void;
    owner: Person;
    type: PersonType;
    period: number;
}) {

    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 500);
    const [date, setDate] = useState<[moment.Moment, moment.Moment]>([
        moment().year(props.period).startOf('year').startOf('day'),
        moment().year(props.period).endOf('year').endOf('day'),
    ]);
    const [data, setData] = useState<Ingreso[]>(props.data);

    useEffect(() => {
        setData(new SETListManipulatorService().filterIncomes(props.data, debouncedQuery, date[0], date[1]))
    }, [debouncedQuery, props.data, date]);

    return <Row gutter={[8, 8]} style={{padding: 8}}>
        <Col span={18}>
            <Row gutter={[8, 8]} align="middle">
                <Col span={2} style={{textAlign: 'right', fontWeight: 'bold'}} offset={1}>
                    Busqueda:
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
            <Row>
                <IncomeTable incomes={data}
                             onRemove={r => {
                             }}
                             onEdit={r => {
                             }}/>
            </Row>
        </Col>
        <Col span={6} style={{border: '1px solid rgb(235, 237, 240)'}}>
        </Col>
    </Row>
}


function IncomeTable(props: {
    incomes: Ingreso[]
    onEdit(row: Ingreso): void;
    onRemove(row: Ingreso): void;
}) {
    return <Table<Ingreso>
        dataSource={props.incomes}
        size="small"
        pagination={{
            pageSize: 10,
        }}
        rowKey="id"
        style={{width: '100%'}}
        columns={[
            {
                title: 'ID',
                dataIndex: 'id',
                defaultSortOrder: 'descend',
                sorter: (a, b) => a.id - b.id,
            },
            {
                title: 'Receptor',
                dataIndex: 'relacionadoNumeroIdentificacion',
                align: 'right',
                render: (_, row) => <>
                    {row.relacionadoNombres} ({row.relacionadoNumeroIdentificacion})
                </>
            },
            {title: 'Factura', dataIndex: 'timbradoDocumento', align: 'right'},
            {
                title: 'Fecha',
                dataIndex: 'fecha',
                sorter: (a, b) => a.fecha.localeCompare(b.fecha),
            },
            {title: 'Monto', align: 'right', dataIndex: 'ingresoMontoTotal', render: (a: number) => formatMoney(a)},
            {
                title: 'Acciones', dataIndex: '', render: (_, row) => {
                    return <>
                        <Button onClick={() => props.onEdit(row)}>Editar</Button>
                        <Button type="danger" onClick={() => props.onRemove(row)}>Eliminar</Button>
                    </>
                }
            }

        ]}
    />

}
