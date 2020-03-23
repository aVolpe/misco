import {Async, NRWrapper} from '../Model';
import {Button, Cascader, Col, Form, Input, InputNumber, Radio, Row} from 'antd';
import React, {useEffect, useRef, useState} from 'react';
import {EGRESO_STATIC_DATA, EGRESO_TYPES} from '../set/ParametroEgreso';
import {CascaderOptionType} from 'antd/lib/cascader';
import {Store} from 'rc-field-form/lib/interface';
import {GlobalHotKeys} from 'react-hotkeys';
import {formatMoney, parseMoney} from '../utils/formatters';
import MaskedInput from 'antd-mask-input/build/main/lib/MaskedInput';
import {PersonWithLetterhead} from '../set/SETService';

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
    letterhead: string;
    expenseNumber: string;
    type: [string, string];
    amount: number;
    isCredit: boolean;
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
    const refDate = useRef<MaskedInput>(null);
    const refQuery = useRef<Input>(null);

    function onRucInput(key: string) {
        if (key === 'Enter') {
            onNewRuc(rucQuery.trim());
        }
    }

    useEffect(() => {
        if (!expense) return;
        form.setFieldsValue(expense);
        if (refQuery.current) refQuery.current.setValue(expense.owner.doc);
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
            isCredit: data.isCredit
        });
        if (refDate.current) refDate.current.focus();
        if (refQuery.current) refQuery.current.setValue('');
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
                <Form layout="vertical" form={form} onFinish={doIt} wrapperCol={{span: 24}}>

                    <Form.Item label="Fecha" name="date" rules={[{required: true}]}>
                        <MaskedInput mask="11/11/11"
                                     ref={refDate}
                                     autoFocus
                                     placeholder="DD/MM/YY"
                                     defaultValue={expense?.date}/>
                    </Form.Item>

                    <Form.Item label="Buscar por RUC">
                        <Input placeholder="4787587, Arturo Volpe, ASISMED"
                               onKeyDown={evt => onRucInput(evt.key)}
                               ref={refQuery}
                               defaultValue={expense?.owner.doc}
                               onBlur={evt => {
                                   setRucQuery(evt.target.value);
                                   onNewRuc(evt.target.value);
                               }}
                               onChange={evt => setRucQuery(evt.target.value)}
                        />
                        <Row>
                            <Col>Nombre: {finalOwner.name}</Col>
                            <Col>RUC: {finalOwner.doc}-{finalOwner.div}</Col>
                        </Row>
                    </Form.Item>

                    <Form.Item label="Timbrado"
                               name="letterhead"
                               rules={[{required: true}]}>
                        <MaskedInput mask="11111111"
                                     defaultValue={expense?.letterhead}
                                     placeholder="12345678"/>
                    </Form.Item>

                    <Form.Item label="Nro Factura" name="expenseNumber" rules={[{required: true}]}>
                        <MaskedInput mask="111-111-1111111"
                                     defaultValue={expense?.expenseNumber}
                                     placeholder="001-002-1234567"/>
                    </Form.Item>

                    <Form.Item label="Monto" name="amount" rules={[{required: true}]}>
                        <InputNumber defaultValue={expense?.amount}
                                     style={{width: '100%'}}
                                     formatter={formatMoney}
                                     parser={parseMoney}
                        />
                    </Form.Item>

                    <Form.Item label="Tipo egreso" name="type">
                        <Cascader options={getSelectOptions('FISICO', '1')}
                                  placeholder="Tipo de egreso"
                                  defaultValue={expense ? expense.type : ['gasto', 'GPERS']}
                                  showSearch={{
                                      filter: (inputValue, path) => {
                                          return path.some(option => (option.label! as string)
                                              .toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
                                      }
                                  }}
                        />
                    </Form.Item>

                    <Form.Item label="Crédito" name="isCredit">
                        <Radio.Group defaultValue={false}>
                            <Radio.Button value={true}>CRÉDITO</Radio.Button>
                            <Radio.Button value={false}>CONTADO</Radio.Button>
                        </Radio.Group>
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

function getSelectOptions(type: 'FISICO' | 'SOCIEDAD_SIMPLE', documentCode: string): CascaderOptionType[] {
    const root = EGRESO_STATIC_DATA[type].find(i => i.codigo === documentCode);
    if (!root) return [];
    return root.egresos.map(e => {
        return {
            value: e.codigo,
            label: e.nombre,
            children: e.subtipos.map(stp => ({
                value: stp,
                label: EGRESO_TYPES[stp]
            }))
        }
    })
}
