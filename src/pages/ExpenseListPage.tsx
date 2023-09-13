import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Col, message, Row} from 'antd';
import {Async, NRHelper, NRWrapper} from '../Model';
import {Help} from '../components/Help';
import {Person} from '../RucAPI';
import {ExpenseForm, ExpenseFormData} from '../components/ExpenseForm';
import {GlobalHotKeys} from 'react-hotkeys';
import {PersonWithLetterhead, SETService} from '../set/SETService';
import {Expense} from "../set/Model";
import {PersonType} from "../set/ParametroEgreso";
import {ExpensePanel} from '../components/ExpensesPanel';

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
                <ExpensePanel data={props.data}
                              doEdit={onEdit}
                              doRemove={props.doRemove}
                              period={props.period}
                />
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

