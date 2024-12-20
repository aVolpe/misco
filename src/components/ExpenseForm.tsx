import {Async, NRWrapper} from '../Model';
import {Alert, Button, Col, Form, Input, InputNumber, Radio, Row, Select, Space, Typography} from 'antd';
import {useEffect, useRef, useState, KeyboardEvent} from 'react';
import {Store} from 'rc-field-form/lib/interface';
import {GlobalHotKeys} from 'react-hotkeys';
import {formatMoney, parseMoney} from '../utils/formatters';
import {PersonWithLetterhead} from '../set/SETService';
import {ExpenseDocumentType} from "../set/V2Enums";
import {AS_OPTIONS} from '../tags/Model';
import {AntMaskedInput, focusNext} from './AntdMaskedInput';
import dayjs from 'dayjs';
import {LoadingOutlined} from '@ant-design/icons';

const checkValidDate = (_: any, value: string) => {
    if (!dayjs(value, "DD/MM/YY", true).isValid()) {
        return Promise.reject(new Error('Fecha inválida'))
    }
    return Promise.resolve();
};

const checkValidAmount = (_: any, value: string) => {
    console.log(value);
    const am = parseInt(value);
    if (am < 1) return Promise.reject(new Error('Monto inválido'));
    return Promise.resolve();
};

export interface ExpenseFormProps {
    expense?: ExpenseFormData,
    owner: Async<PersonWithLetterhead>
    onNewRuc: (ruc: string) => void;
    onSubmit: (data: ExpenseFormData) => Promise<void>;
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
}: Readonly<ExpenseFormProps>) {

    const finalOwner = NRWrapper.of(owner).orElse({
        doc: '',
        name: '',
        div: ''
    });

    const [rucQuery, setRucQuery] = useState('');
    const [form] = Form.useForm();
    const refDate = useRef<HTMLInputElement>(null);

    function onRucInput(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            onNewRuc(rucQuery.trim());
        }
        return focusNext(e);
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

    async function doIt(data: Store) {
        await onSubmit({
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
        refDate.current?.focus();
        setRucQuery('');
    }

    function letterheadKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.altKey && ['d', 'ð'].includes(e.key)) {
            e.preventDefault();
            form.setFieldValue('letterhead', '');
            return;
        }
        focusNext(e);
    }


    return <GlobalHotKeys
        keyMap={{
            SAVE_EXPENSE: ["Control+g"]
        }}
        handlers={{
            SAVE_EXPENSE: form.submit
        }}>
        <Row gutter={8} style={{paddingLeft: 8, paddingRight: 8}}>
            <Col span={24}>
                <Typography.Title level={3} style={{marginTop: 8, marginBottom: 8}}>
                    {editType === 'EDIT' ? `Editando factura` : 'Creando'}
                </Typography.Title>
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
                            ref={refDate}
                            placeholder="DD/MM/YY (si es salario, poner cualquier día del mes)"
                            autoFocus
                            onKeyDown={focusNext}
                            mask="__/__/__"
                            replacement={{_: /\d/}} />
                    </Form.Item>

                    <Form.Item label="Tipo egreso" name="type">
                        <Select options={getAvailableTypes()}
                            placeholder="Tipo de egreso"
                            onInputKeyDown={focusNext}
                            showSearch
                        />
                    </Form.Item>

                    <Form.Item label="Buscar por RUC">
                        <Input placeholder="4787587, Arturo Volpe, ASISMED"
                            onKeyDown={onRucInput}
                            defaultValue={expense?.owner.doc}
                            value={rucQuery}
                            onBlur={evt => {
                                onNewRuc(evt.target.value);
                            }}
                            onChange={evt => setRucQuery(evt.target.value)}
                        />
                        {owner.state === 'FETCHING' && <LoadingOutlined />}
                        {owner.state === 'ERROR' && <Alert type="error" showIcon message="No encontrado" style={{marginTop: 4}}/>}
                        {owner.state === "LOADED" &&  <Space direction="vertical" style={{rowGap: 0}}>
                            <span>Nombre: {finalOwner.name}</span>
                            <span>RUC: {finalOwner.doc}-{finalOwner.div}</span>
                        </Space>}
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
                                    rules={[{required: true, message: "Timbrado requerido"}]}>
                                    <AntMaskedInput
                                        placeholder="12345678"
                                        mask="________"
                                        onKeyDown={letterheadKeyDown}
                                        replacement={{_: /\d/}} />
                                </Form.Item>

                                <Form.Item label="Nro Factura" name="expenseNumber" rules={[
                                    {required: true, message: "Requerido"}
                                ]}>
                                    <AntMaskedInput
                                        placeholder='001-001-0000000'
                                        mask="___-___-_______"
                                        onKeyDown={focusNext}
                                        replacement={{_: /\d/}} />
                                </Form.Item>

                                <Form.Item label="Crédito" name="isCredit">
                                    <Radio.Group>
                                        <Radio.Button value={true} onKeyDown={focusNext}>CRÉDITO</Radio.Button>
                                        <Radio.Button value={false} onKeyDown={focusNext}>CONTADO</Radio.Button>
                                    </Radio.Group>
                                </Form.Item>
                            </>
                        }}
                    </Form.Item>

                    <Form.Item label="Monto" name="amount" rules={[
                        {required: true, message: "Monto requerido"},
                        {validator: checkValidAmount}
                    ]}>
                        <InputNumber style={{width: '100%'}}
                            formatter={a => formatMoney(a)}
                            onKeyDown={focusNext}
                            parser={parseMoney}
                        />
                    </Form.Item>

                    <Form.Item label="Tags" name="tags">
                        <Select
                            mode="multiple"
                            allowClear
                            style={{width: '100%'}}
                            placeholder="Elija un tag (no es requerido)"
                            options={AS_OPTIONS}
                        />
                    </Form.Item>

                    <pre hidden>{JSON.stringify(expense?.type, null, 2)}</pre>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">Guardar (Control+g)</Button>
                            <Button type="default" onClick={onCancel}>Cancelar</Button>
                        </Space>
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
