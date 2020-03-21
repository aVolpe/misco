import {Async, NRWrapper} from '../Model';
import {Button, Cascader, Col, Form, Input, InputNumber, Row} from 'antd';
import React, {useState} from 'react';
import {Person} from '../RucAPI';
import {MaskedInput} from 'antd-mask-input';
import {EGRESO_STATIC_DATA, EGRESO_TYPES} from '../set/ParametroEgreso';
import {CascaderOptionType} from 'antd/lib/cascader';
import {Store} from 'rc-field-form/lib/interface';

export interface InvoiceFormProps {
    invoice?: InvoiceFormData,
    owner: Async<Person>
    onNewRuc: (ruc: string) => void;
    onSubmit: (data: InvoiceFormData) => void;
    onCancel: () => void;
}

export interface InvoiceFormData {
    owner: Person;
    date: string;
    letterhead: string;
    invoiceNumber: string;
    type: [string, string];
    amount: number;
}

export function InvoiceForm({
                                invoice,
                                owner,
                                onNewRuc,
                                onSubmit,
                                onCancel
                            }: InvoiceFormProps) {

    const finalOwner = NRWrapper.of(owner).orElse({
        doc: '',
        name: '',
        div: ''
    });

    const [rucQuery, setRucQuery] = useState('');
    const [form] = Form.useForm();

    function onRucInput(key: string) {
        if (key === 'Enter') {
            onNewRuc(rucQuery.trim());
        }
    }

    function doIt(data: Store) {
        onSubmit({
            amount: data.amount,
            date: data.date,
            letterhead: data.letterhead,
            invoiceNumber: data.invoiceNumber,
            owner: finalOwner,
            type: data.type
        });
    }


    return <Row gutter={16} style={{padding: 8}}>
        <Form layout="vertical" form={form} onFinish={doIt}>

            <Form.Item label="Fecha" name="date" rules={[{required: true}]}>
                <MaskedInput mask="11/11/11"
                             placeholder="DD/MM/YY"
                             defaultValue={invoice?.date}
                             name="card"/>
            </Form.Item>

            <Form.Item label="Buscar por RUC">
                <Input placeholder="4787587, Arturo Volpe, ASISMED"
                       onKeyDown={evt => onRucInput(evt.key)}
                       defaultValue={invoice?.owner.doc}
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
                             defaultValue={invoice?.letterhead}
                             placeholder="12345678"/>
            </Form.Item>

            <Form.Item label="Nro Factura" rules={[{required: true}]}>
                <MaskedInput mask="111-111-1111111"
                             defaultValue={invoice?.invoiceNumber}
                             placeholder="001-002-1234567"
                             name="invoiceNumber"/>
            </Form.Item>

            <Form.Item label="Monto" rules={[{required: true}]}>
                <InputNumber placeholder="100000"
                             defaultValue={invoice?.amount}
                             style={{width: '100%'}}
                             name="amount"/>
                <pre hidden>{JSON.stringify(invoice?.amount, null, 2)}</pre>
            </Form.Item>

            <Form.Item label="Tipo egreso">
                <Cascader options={getSelectOptions('FISICO', '1')}
                          onChange={e => console.log(e)}
                          placeholder="Tipo de egreso"
                          defaultValue={invoice ? invoice.type : ['gasto', 'GPERS']}
                          showSearch={{
                              filter: (inputValue, path) => {
                                  return path.some(option => (option.label! as string)
                                      .toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
                              }
                          }}
                />
                <pre hidden>{JSON.stringify(invoice?.type, null, 2)}</pre>
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" style={{width: '50%'}}>Siguiente</Button>
                <Button type="default" onClick={onCancel} style={{width: '50%'}}>Cancelar</Button>
            </Form.Item>

        </Form>
        <br/>
        {JSON.stringify(finalOwner, null, 2)}
        <br/>
    </Row>
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
