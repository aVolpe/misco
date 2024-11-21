import {useCallback, useEffect, useMemo, useState} from 'react';
import {Button, Col, DatePicker, Input, message, Row, Table, Typography} from 'antd';
import {Person} from '../RucAPI';
import {formatMoney} from '../utils/formatters';
import {PersonType} from '../set/ParametroEgreso';
import {useDebounce} from '../utils/Hooks';
import {SETListManipulatorService} from '../set/SETListManipulatorService';
import {sumBy} from 'lodash';
import {PersonWithLetterhead, SETService} from '../set/SETService';
import {Async, NRHelper, NRWrapper} from '../Model';
import {IncomeForm, IncomeFormData} from '../components/IncomeForm';
import {emptyOwner} from './ExpenseListPage';
import {Help} from '../components/Help';
import {Income} from "../set/Model";
import {IncomeType, PaymentType} from "../set/V2Enums";
import dayjs from 'dayjs';

const defaultIncome: IncomeFormData = {
    date: '',
    letterhead: '',
    incomeNumber: '',
    type: 'salary',
    owner: emptyOwner,
    amount: 0,
    isCredit: false
};

export function IncomeListPage(props: {
    data: Income[];
    onSave: (income: IncomeFormData, id?: number) => { wasNew: boolean };
    doRemove: (incomeId: number) => void;
    owner: Person;
    type: PersonType;
    period: number;
}) {

    const [current, setCurrent] = useState<IncomeFormData>();
    const [currentId, setCurrentId] = useState<number>();
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 500);
    const [date, setDate] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
        dayjs().year(props.period).startOf('year').startOf('day'),
        dayjs().year(props.period).endOf('year').endOf('day'),
    ]);
    const [data, setData] = useState<Income[]>(props.data);
    const service = useMemo(() => new SETService(props.period, props.owner, props.type, [], props.data),
        [props.data, props.period, props.type, props.owner]);

    useEffect(() => {
        setData(new SETListManipulatorService().filterIncomes(props.data, debouncedQuery, date[0], date[1]))
    }, [debouncedQuery, props.data, date]);


    function onEdit(d: Income) {
        setCurrentId(d.id);
        setCurrent(service.mapIngresoToForm(d));
    }

    function onNewIncome(base?: IncomeFormData) {
        console.log('new ', base || defaultIncome);
        setCurrent(JSON.parse(JSON.stringify((base || defaultIncome))));
        setCurrentId(undefined);
    }

    function onSave(d: IncomeFormData) {
        if (props.onSave(d, currentId).wasNew) {
            message.info(`Factura ${d.incomeNumber} guardada`, 5);
            onNewIncome({...d, date: ''});
        } else {
            message.info("Income actualizado", 5);
            setCurrentId(undefined);
            setCurrent(undefined);
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
                <IncomeTable incomes={data}
                             onRemove={r => props.doRemove(r.id)}
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
    incomes: Income[]
    onEdit(row: Income): void;
    onRemove(row: Income): void;
}) {
    return <Table<Income>
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
            dataIndex: 'type',
            align: 'right',
            render: (_, row) => <>
                <span>{IncomeType[row.type]}</span>
                {<><br/> <small>{PaymentType[row.paymentType]}</small></>}
            </>,
            sorter: (a, b) => IncomeType[a.type]
                .localeCompare(IncomeType[b.type]),
        }, {
            title: 'Fecha',
            dataIndex: 'date',
            sorter: (a, b) => (a.date || '').localeCompare(b.date || ''),
        }, {
            title: 'Receptor',
            dataIndex: 'identifier',
            align: 'left',
            render: (_, row) => <>
                {row.name}
                <br/>({row.identifier})
            </>
        }, {
            title: 'Monto',
            align: 'right',
            dataIndex: 'amount',
            render: (a: number) => formatMoney(a),
            sorter: (a, b) => a.amount - b.amount,
        }, {
            title: 'Acciones', 
            align: 'right',
            dataIndex: '', render: (_, row) => {
                return <>
                    <Button onClick={() => props.onEdit(row)}>Editar</Button>
                    <Button danger onClick={() => props.onRemove(row)}>Eliminar</Button>
                </>
            }
        }

        ]}
        summary={pageData => {
            const sum = sumBy(props.incomes, 'amount');
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
