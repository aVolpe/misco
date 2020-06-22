import {Async, NRWrapper} from '../Model';
import {Button, Cascader, Col, Form, Input, InputNumber, Radio, Row} from 'antd';
import React, {useEffect, useRef, useState} from 'react';
import {CascaderOptionType} from 'antd/lib/cascader';
import {Store} from 'rc-field-form/lib/interface';
import {GlobalHotKeys} from 'react-hotkeys';
import {formatMoney, parseMoney} from '../utils/formatters';
import MaskedInput from 'antd-mask-input/build/main/lib/MaskedInput';
import {PersonWithLetterhead} from '../set/SETService';
import {INGRESO_STATIC_DATA, INGRESO_TYPES} from '../set/ParametroIngreso';
import {PersonType} from '../set/ParametroEgreso';

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
    type: [string, string];
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
    const refDate = useRef<MaskedInput>(null);
    const refQuery = useRef<Input>(null);

    function onRucInput(key: string) {
        if (key === 'Enter') {
            onNewRuc(rucQuery.trim());
        }
    }

    useEffect(() => {
        if (!income) return;
        form.setFieldsValue(income);
        if (refQuery.current) refQuery.current.setValue(income.owner.doc);
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
        if (refQuery.current) refQuery.current.setValue('');
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
                        <Cascader options={getSelectOptions('FISICO')}
                                  placeholder="Tipo de egreso"
                                  defaultValue={income ? income.type : ['1', 'REMDEP']}
                                  showSearch={{
                                      filter: (inputValue, path) => {
                                          return path.some(option => (option.label! as string)
                                              .toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
                                      }
                                  }}
                        />
                    </Form.Item>

                    <Form.Item label="Buscar por RUC">
                        <Input placeholder="4787587, Arturo Volpe, ASISMED"
                               onKeyDown={evt => onRucInput(evt.key)}
                               ref={refQuery}
                               defaultValue={income?.owner.doc}
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
                                     formatter={formatMoney}
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

function getSelectOptions(type: PersonType): CascaderOptionType[] {
    const root = INGRESO_STATIC_DATA[type];
    if (!root) return [];
    return root.map(e => {
        return {
            value: e.codigo,
            label: e.nombre,
            children: e.opciones.map(stp => ({
                value: stp,
                label: INGRESO_TYPES[stp]
            }))
        }
    })
}
