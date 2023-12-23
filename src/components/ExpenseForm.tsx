import {Async, NRWrapper} from '../Model';
import {Button, Col, Form, Input, InputNumber, InputRef, Radio, Row, Select, Space} from 'antd';
import React, {useEffect, useRef, useState} from 'react';
import {Store} from 'rc-field-form/lib/interface';
import {GlobalHotKeys} from 'react-hotkeys';
import {formatMoney, parseMoney} from '../utils/formatters';
import {PersonWithLetterhead, SETService} from '../set/SETService';
import {ExpenseDocumentType} from "../set/V2Enums";
import {AS_OPTIONS} from '../tags/Model';
import { AntMaskedInput} from './AntdMaskedInput';
import { InputMask } from '@react-input/mask';
import dayjs from 'dayjs';

const checkValidDate = (_: any, value: string) => {
    if (!dayjs(value, "DD/MM/YY", true).isValid()) {
        return Promise.reject(new Error('Fecha inválida'))
    }
    return Promise.resolve();
};

export interface ExpenseFormProps {
    expense?: ExpenseFormData,
    owner: Async<PersonWithLetterhead>
    onNewRuc: (ruc: string) => void;
    onSubmit: (data: ExpenseFormData) => void;
    onCancel: () => void;
    editType: 'NEW' | 'EDIT';
}

export interface ExpenseFormData {
    owner: PersonWithLetterhead;
    date: string;
    letterhead?: string;
    expenseNumber?: string;
    type: keyof typeof ExpenseDocumentType;
    amount: number;
    isCredit: boolean;
    tags?: string[];
}

export function ExpenseForm({
                                expense,
                                owner,
                                onNewRuc,
                                onSubmit,
                                onCancel,
                                editType
                            }: ExpenseFormProps) {

    const finalOwner = NRWrapper.of(owner).orElse({
        doc: '',
        name: '',
        div: ''
    });

    const [rucQuery, setRucQuery] = useState('');
    const [form] = Form.useForm();
    const refDate = useRef<InputRef>(null);

    function onRucInput(key: string) {
        if (key === 'Enter') {
            onNewRuc(rucQuery.trim());
        }
    }

    useEffect(() => {
        if (!expense) return;
        form.setFieldsValue(expense);
        setRucQuery(expense.owner.doc);
    }, [form, expense]);

    const newLetterHead = NRWrapper.of(owner).map(o => o.letterhead).orElse('');
    useEffect(() => {
        form.setFields([{
            name: 'letterhead',
            value: newLetterHead
        }])

    }, [newLetterHead, form]);

    function doIt(data: Store) {
        onSubmit({
            ...expense,
            amount: Number(data.amount),
            date: data.date,
            letterhead: data.letterhead,
            expenseNumber: data.expenseNumber,
            owner: finalOwner,
            type: data.type,
            isCredit: data.isCredit,
            tags: data.tags
        });
        if (refDate.current) refDate.current.focus();
        setRucQuery('');
    }


    return <GlobalHotKeys
        keyMap={{
            SAVE_EXPENSE: ["Control+g"]
        }}
        handlers={{
            SAVE_EXPENSE: form.submit
        }}>
        <Row gutter={16} style={{padding: 8}}>
            <Col span={24}>
                <h1>{editType === 'EDIT' ? 'Editando' : 'Creando'}</h1>
            </Col>
            <Col span={24}>
                <Form layout="vertical" form={form} onFinish={doIt} wrapperCol={{span: 24}} initialValues={{
                    date: expense?.date,
                    letterhead: expense?.letterhead,
                    expenseNumber: expense?.expenseNumber,
                    isCredit: expense?.isCredit || false,
                    amount: expense?.amount
                }}>

                    <Form.Item label="Fecha" name="date" rules={[{validator: checkValidDate}]}>

                        <AntMaskedInput
                            placeholder="DD/MM/YY (si es salario, poner cualquier día del mes)"
                            autoFocus
                            mask="__/__/__" 
                            replacement={{ _: /\d/ }} />
                    </Form.Item>

                    <Form.Item label="Tipo egreso" name="type">
                        <Select options={getAvailableTypes()}
                                placeholder="Tipo de egreso"
                                showSearch
                        />
                    </Form.Item>

                    <Form.Item label="Buscar por RUC">
                        <Input placeholder="4787587, Arturo Volpe, ASISMED"
                               onKeyDown={evt => onRucInput(evt.key)}
                               defaultValue={expense?.owner.doc}
                               value={rucQuery}
                               onBlur={evt => {
                                   onNewRuc(evt.target.value);
                               }}
                               onChange={evt => setRucQuery(evt.target.value)}
                        />
                        <Space direction="horizontal">
                            <span>Nombre: {finalOwner.name}</span>
                            <span>RUC: {finalOwner.doc}-{finalOwner.div}</span>
                        </Space>
                    </Form.Item>

                    <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.type !== curValues.type}>
                        {data => {
                            const type = data.getFieldValue("type") || [];
                            if (
                                type[0] === "5" && type[1] === 'gasto' && type[2] === 'DESCJBPN'
                            ) return null
                            return <>
                                <Form.Item name="letterhead"
                                           label="Timbrado"
                                           rules={[{required: true}]}>

                                    <Input placeholder="12345678"
                                           maxLength={8}
                                           minLength={8}/>
                                </Form.Item>

                                <Form.Item label="Nro Factura" name="expenseNumber" rules={[{required: true}]}>
                                    <AntMaskedInput
                                        placeholder='001-001-0000000'
                                        mask="___-___-_______" 
                                        replacement={{ _: /\d/ }} />
                                </Form.Item>

                                <Form.Item label="Crédito" name="isCredit">
                                    <Radio.Group>
                                        <Radio.Button value={true}>CRÉDITO</Radio.Button>
                                        <Radio.Button value={false}>CONTADO</Radio.Button>
                                    </Radio.Group>
                                </Form.Item>
                            </>
                        }}
                    </Form.Item>

                    <Form.Item label="Monto" name="amount" rules={[{required: true}]}>
                        <InputNumber style={{width: '100%'}}
                                     formatter={a => formatMoney(a)}
                                     parser={parseMoney}
                        />
                    </Form.Item>

                    <Form.Item label="Tags" name="tags">
                        <Select
                            mode="multiple"
                            allowClear
                            style={{width: '100%'}}
                            placeholder="Elija un tag (no es requerido"
                            options={AS_OPTIONS}
                        />
                    </Form.Item>

                    <pre hidden>{JSON.stringify(expense?.type, null, 2)}</pre>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{width: '50%'}}>Guardar (Control+g)</Button>
                        <Button type="default" onClick={onCancel} style={{width: '50%'}}>Cancelar</Button>
                    </Form.Item>

                </Form>
            </Col>
        </Row>
    </GlobalHotKeys>;
}

function getAvailableTypes() {
    const types = ExpenseDocumentType as Record<string, string>;
    return Object.keys(types).map((k: any) => ({
        value: k,
        label: types[k]
    }));
}
