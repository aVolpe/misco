import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Button, Col, DatePicker, Input, message, Popover, Row, Table, Typography} from 'antd';
import {Person} from '../RucAPI';
import {Ingreso} from '../set/ArandukaModel';
import {formatMoney} from '../utils/formatters';
import {PersonType} from '../set/ParametroEgreso';
import {useDebounce} from '../utils/Hooks';
import moment from 'moment';
import {SETListManipulatorService} from '../set/SETListManipulatorService';
import {sumBy} from 'lodash';
import {PersonWithLetterhead, SETService} from '../set/SETService';
import {Async, NRHelper, NRWrapper} from '../Model';
import {IncomeForm, IncomeFormData} from '../components/IncomeForm';
import {emptyOwner} from './ExpenseListPage';
import {Help} from '../components/Help';

const defaultIncome: IncomeFormData = {
    date: '',
    letterhead: '',
    incomeNumber: '',
    type: ['1', 'HPRSP'],
    owner: emptyOwner,
    amount: 0,
    isCredit: false
};

export function IncomeListPage(props: {
    data: Ingreso[];
    setData: (newData: Ingreso[]) => void;
    owner: Person;
    type: PersonType;
    period: number;
}) {

    const [current, setCurrent] = useState<IncomeFormData>();
    const [currentId, setCurrentId] = useState<number>();
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 500);
    const [date, setDate] = useState<[moment.Moment, moment.Moment]>([
        moment().year(props.period).startOf('year').startOf('day'),
        moment().year(props.period).endOf('year').endOf('day'),
    ]);
    const [data, setData] = useState<Ingreso[]>(props.data);
    const service = useMemo(() => new SETService(props.period, props.owner, props.type, [], props.data),
        [props.data, props.period, props.type, props.owner]);

    useEffect(() => {
        setData(new SETListManipulatorService().filterIncomes(props.data, debouncedQuery, date[0], date[1]))
    }, [debouncedQuery, props.data, date]);

    function onRemove(d: Ingreso) {
        props.setData(props.data.filter(it => it.id !== d.id));
    }

    function onEdit(d: Ingreso) {
        setCurrentId(d.id);
        setCurrent(service.mapIngresoToForm(d));
    }

    function onNewIncome(base?: IncomeFormData) {
        console.log('new ', base || defaultIncome);
        setCurrent(JSON.parse(JSON.stringify((base || defaultIncome))));
        setCurrentId(undefined);
    }

    function onSave(d: IncomeFormData) {
        console.log(d);
        if (currentId) {
            message.info("Ingreso actualizado", 5);
            props.setData(props.data.map(it => {
                return it.id === currentId ? service.mapIncome(d, currentId) : it;
            }));
            setCurrentId(undefined);
            setCurrent(undefined);
        } else {
            // it's a new
            message.info(`Factura ${d.incomeNumber} guardada`, 5);
            props.setData([...props.data, service.mapIncome(d)]);
            onNewIncome({...d, date: ''});
        }
    }

    return <Row gutter={[8, 8]} style={{padding: 8}}>
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
                             onRemove={r => onRemove(r)}
                             onEdit={onEdit}/>
            </Row>
        </Col>
        <Col span={6} style={{border: '1px solid rgb(235, 237, 240)'}}>
            {current
                ? <IncomeEditor current={current}
                                service={service}
                                onCancel={() => setCurrent(undefined)}
                                editType={currentId ? 'EDIT' : 'NEW'}
                                onSave={onSave}/>
                : <Help onNewInvoice={() => onNewIncome()} type="income"/>
            }
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
        columns={[{
            title: 'ID',
            dataIndex: 'id',
            defaultSortOrder: 'descend',
            sorter: (a, b) => a.id - b.id,
        }, {
            title: 'Detalles',
            dataIndex: 'timbradoCondicion',
            align: 'right',
            render: (_, row) => <>
                <Popover content={`${row.tipoTexto}/${row.tipoIngresoTexto}`}
                         title={`${row.tipoTexto}/${row.tipoIngresoTexto}`}>
                    <span>{row.tipo}/{row.tipoIngreso}</span>
                </Popover>
                {row.timbradoCondicion && <><br/> <small>{row.timbradoCondicion}</small></>}
            </>,
            sorter: (a, b) => `${a.tipo}/${a.tipoIngresoTexto}`
                .localeCompare(`${b.tipo}/${b.tipoIngresoTexto}`),
        }, {
            title: 'Fecha',
            dataIndex: 'fecha',
            sorter: (a, b) => (a.fecha || '').localeCompare(b.fecha || ''),
        }, {
            title: 'Receptor',
            dataIndex: 'relacionadoNumeroIdentificacion',
            align: 'left',
            render: (_, row) => <>
                {row.relacionadoNombres}
                <br/>({row.relacionadoNumeroIdentificacion})
                {row.timbradoCondicion && <><br/>({row.timbradoCondicion})</>}
            </>
        }, {
            title: 'Monto',
            align: 'right',
            dataIndex: 'ingresoMontoTotal',
            render: (a: number) => formatMoney(a),
            sorter: (a, b) => a.ingresoMontoTotal - b.ingresoMontoTotal,
        }, {
            title: 'Acciones', dataIndex: '', render: (_, row) => {
                return <>
                    <Button onClick={() => props.onEdit(row)}>Editar</Button>
                    <Button type="danger" onClick={() => props.onRemove(row)}>Eliminar</Button>
                </>
            }
        }

        ]}
        summary={pageData => {
            const sum = sumBy(props.incomes, 'ingresoMontoTotal');
            return <tr>
                <th colSpan={3}>Total (todas las filas)</th>
                <td/>
                <td className="ant-table-cell" style={{textAlign: 'right', padding: 8}}>
                    <Typography.Text>{formatMoney(sum)}</Typography.Text>
                </td>
                <td/>
            </tr>
        }}
    />

}

function IncomeEditor(props: {
    editType: 'NEW' | 'EDIT';
    current: IncomeFormData;
    onSave: (n: IncomeFormData) => void;
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


    return <IncomeForm owner={owner}
                       editType={props.editType}
                       onSubmit={ev => {
                           setOwner(NRHelper.loaded(emptyOwner));
                           props.onSave(ev);
                       }}
                       onCancel={props.onCancel}
                       income={props.current}
                       onNewRuc={onNewRuc}/>;
}
