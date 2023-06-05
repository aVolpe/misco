import {Async, NRWrapper} from '../Model';
import {Button, Col, Form, Input, InputNumber, InputRef, Radio, Row, Select} from 'antd';
import React, {useEffect, useRef, useState} from 'react';
import {Store} from 'rc-field-form/lib/interface';
import {GlobalHotKeys} from 'react-hotkeys';
import {formatMoney, parseMoney} from '../utils/formatters';
import MaskedInput from 'antd-mask-input/build/main/lib/MaskedInput';
import {PersonWithLetterhead} from '../set/SETService';
import {IncomeType} from "../set/V2Enums";

export interface IncomeFormProps {
    income?: IncomeFormData,
    owner: Async<PersonWithLetterhead>
    onNewRuc: (ruc: string) => void;
    onSubmit: (data: IncomeFormData) => void;
    onCancel: () => void;
    editType: 'NEW' | 'EDIT';
}

export interface IncomeFormData {
    owner: PersonWithLetterhead;
    date: string;
    letterhead?: string;
    incomeNumber?: string;
    type: keyof typeof IncomeType;
    amount: number;
    isCredit: boolean;
}


export function IncomeForm({
                               income,
                               owner,
                               onNewRuc,
                               onSubmit,
                               onCancel,
                               editType
                           }: IncomeFormProps) {

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
        if (!income) return;
        form.setFieldsValue(income);
        setRucQuery(income.owner.doc);
    }, [form, income]);

    const newLetterHead = NRWrapper.of(owner).map(o => o.letterhead).orElse('');
    useEffect(() => {
        form.setFields([{
            name: 'letterhead',
            value: newLetterHead
        }])

    }, [newLetterHead, form]);

    function doIt(data: Store) {
        onSubmit({
            ...income,
            amount: Number(data.amount),
            date: data.date,
            letterhead: data.letterhead,
            incomeNumber: data.incomeNumber,
            owner: finalOwner,
            type: data.type,
            isCredit: data.isCredit
        });
        if (refDate.current) refDate.current.focus();
        setRucQuery('');
    }


    return <GlobalHotKeys
        keyMap={{
            SAVE_Income: ["Control+g"]
        }}
        handlers={{
            SAVE_Income: form.submit
        }}>
        <Row gutter={16} style={{padding: 8}}>
            <Col span={24}>
                <h1>{editType === 'EDIT' ? 'Editando' : 'Nuevo ingreso'}</h1>
            </Col>
            <Col span={24}>
                <Form layout="vertical" form={form} onFinish={doIt} wrapperCol={{span: 24}}>

                    <Form.Item label="Fecha" name="date" rules={[{required: true}]}>
                        <MaskedInput mask="11/11/11"
                                     ref={refDate}
                                     autoFocus
                                     placeholder="DD/MM/YY (si es salario, poner cualquier día del mes)"
                                     defaultValue={income?.date}/>
                    </Form.Item>

                    <Form.Item label="Tipo ingreso" name="type">
                        <Select options={getAvailableTypes()}
                                placeholder="Tipo de egreso"
                                showSearch
                        />
                    </Form.Item>

                    <Form.Item label="Buscar por RUC">
                        <Input placeholder="4787587, Arturo Volpe, ASISMED"
                               onKeyDown={evt => onRucInput(evt.key)}
                               value={rucQuery}
                               defaultValue={income?.owner.doc}
                               onBlur={evt => {
                                   onNewRuc(evt.target.value);
                               }}
                               onChange={evt => setRucQuery(evt.target.value)}
                        />
                        <Row>
                            <Col>Nombre: {finalOwner.name}</Col>
                            <Col>RUC: {finalOwner.doc}-{finalOwner.div}</Col>
                        </Row>
                    </Form.Item>

                    <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.type !== curValues.type}>
                        {data => {
                            const type = data.getFieldValue("type") || [];
                            if (type[0] === "5") return null
                            return <>
                                <Form.Item name="letterhead"
                                           label="Timbrado"
                                           rules={[{required: true}]}>
                                    <MaskedInput mask="11111111"
                                                 defaultValue={income?.letterhead}
                                                 placeholder="12345678"/>
                                </Form.Item>

                                <Form.Item label="Nro Factura" name="incomeNumber" rules={[{required: true}]}>
                                    <MaskedInput mask="111-111-1111111"
                                                 defaultValue={income?.incomeNumber}
                                                 placeholder="001-002-1234567"/>
                                </Form.Item>

                                <Form.Item label="Crédito" name="isCredit">
                                    <Radio.Group defaultValue={false}>
                                        <Radio.Button value={true}>CRÉDITO</Radio.Button>
                                        <Radio.Button value={false}>CONTADO</Radio.Button>
                                    </Radio.Group>
                                </Form.Item>
                            </>
                        }}
                    </Form.Item>


                    <Form.Item label="Monto" name="amount" rules={[{required: true}]}>
                        <InputNumber defaultValue={income?.amount}
                                     style={{width: '100%'}}
                                     formatter={m => formatMoney(m)}
                                     parser={parseMoney}
                        />
                    </Form.Item>


                    <pre hidden>{JSON.stringify(income?.type, null, 2)}</pre>

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
    const types = IncomeType as Record<string, string>;
    return Object.keys(types).map((k: any) => ({
        value: k,
        label: types[k]
    }));
}
