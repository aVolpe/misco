import React, {useState} from 'react';
import {useLocalStorage} from '@rehooks/local-storage';
import {Egreso, Familiar, Identificacion, Informante, Ingreso, PresentationType} from '../set/ArandukaModel';
import {EXAMPLE_DATA} from '../set/ExampleData';
import {SETExporter} from '../set/SETExporter';
import {Button, Col, Form, InputNumber, Modal, Radio, Row} from 'antd';

export function Exporter() {

    const [informer] = useLocalStorage<Informante>('informante', EXAMPLE_DATA.informante);
    const [incomes] = useLocalStorage<Ingreso[]>('ingresos', []);
    const [expenses] = useLocalStorage<Egreso[]>('egresos', []);
    const [identity] = useLocalStorage<Identificacion>('identificacion', EXAMPLE_DATA.identificacion);
    const [family] = useLocalStorage<Familiar[]>('identificacion', []);

    const [showArandukaExport, setShowArandukaExport] = useState(false);

    function downloadAll() {
        new SETExporter()
            .downloadData({
                ingresos: incomes!,
                familiares: family!,
                identificacion: identity!,
                informante: informer!,
                egresos: expenses!
            })
    }

    function downloadPeriod(period: number, type: PresentationType) {
        new SETExporter()
            .downloadPeriod({
                ingresos: incomes!,
                familiares: family!,
                identificacion: identity!,
                informante: informer!,
                egresos: expenses!
            }, period, type);
        setShowArandukaExport(false);
    }

    function downloadIncomesExcel() {
        new SETExporter().downloadExcel(informer!, 'ingresos', incomes!);
    }

    function downloadExpensesExcel() {
        new SETExporter().downloadExcel(informer!, 'egresos', expenses!);
    }

    return <Row gutter={[8, 8]}>
        <Col span={24}>
            <div style={{textAlign: 'center'}}>
                <small>
                    Puedes exportar tus datos de varias maneras, dependiendo del uso
                    que les daras.
                </small>
            </div>
        </Col>

        <table style={{width: '100%'}}>
            <tbody>
            <tr>
                <td>
                    <b>Completo</b>
                    <br/>
                    <small>Todos los datos almacenados, útil para guardar y continuar la sesión mas tarde</small>
                </td>
                <td style={{verticalAlign: 'bottom'}}>
                    <Button onClick={downloadAll} style={{width: '100%'}}>Exportar</Button>
                </td>
            </tr>
            <tr>
                <td>
                    <b>Aranduka</b>
                    <br/>
                    <small>Todos los datos almacenados, filtrados por periodo</small>
                </td>
                <td style={{verticalAlign: 'bottom'}}>
                    <Button onClick={() => setShowArandukaExport(true)} style={{width: '100%'}}>
                        Descargar Aranduka
                    </Button>
                </td>
            </tr>
            <tr>
                <td>
                    <b>Ingresos en excel</b>
                    <br/>
                    <small>Exportar todos los ingresos, en formato excel para su manipulación</small>
                </td>
                <td style={{verticalAlign: 'bottom'}}>
                    <Button onClick={downloadIncomesExcel} style={{width: '100%'}}>Descargar 'ingresos.csv'</Button>
                </td>
            </tr>
            <tr>
                <td>
                    <b>Egresos en excel</b>
                    <br/>
                    <small>Exportar todos los egresos, en formato excel para su manipulación</small>
                </td>
                <td style={{verticalAlign: 'bottom'}}>
                    <Button onClick={downloadExpensesExcel} style={{width: '100%'}}>Descargar 'egresos.csv'</Button>
                </td>
            </tr>
            </tbody>
        </table>
        <Modal visible={showArandukaExport}
               title="Exportar a aranduka"
               footer={null}
               onCancel={() => setShowArandukaExport(false)}
        >
            <ArandukaExport ide={identity!}
                            inf={informer!}
                            onFinish={d => downloadPeriod(d.periodo, d.tipoPresentacion)}/>
        </Modal>

    </Row>
}

function ArandukaExport(props: {
    inf: Informante,
    ide: Identificacion,
    onFinish: (data: { tipoPresentacion: PresentationType, periodo: number }) => void
}) {
    return <div>
        <h3>Debes introducir los datos para la descarga</h3>
        <Form wrapperCol={{span: 20}}
              labelCol={{span: 4}}
              onFinish={re => props.onFinish({tipoPresentacion: re.tipoPresentacion, periodo: re.periodo})}
              initialValues={{
                  tipoPresentacion: props.ide.tipoPresentacion,
                  periodo: Number(props.ide.periodo)
              }}>
            <Form.Item label="Periodo" name="periodo" rules={[{required: true}]}>
                <InputNumber style={{width: '100%'}}/>
            </Form.Item>
            <Form.Item label="Tipo" name="tipoPresentacion">
                <Radio.Group>
                    <Radio.Button value="ORIGINAL">ORIGINAL</Radio.Button>
                    <Radio.Button value="RECTIFICATIVA">RECTIFICATIVA</Radio.Button>
                </Radio.Group>
            </Form.Item>
            <Form.Item wrapperCol={{offset: 4, span: 16}}>
                <Button type="primary" htmlType="submit">
                    Descargar
                </Button>
            </Form.Item>
        </Form>

    </div>
}
