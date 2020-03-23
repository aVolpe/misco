import React from 'react';
import {useLocalStorage} from '@rehooks/local-storage';
import {Egreso, Familiar, Identificacion, Informante, Ingreso} from '../set/ArandukaModel';
import {EXAMPLE_DATA} from '../set/ExampleData';
import {SETExporter} from '../set/SETExporter';
import {Button, Col, Row} from 'antd';

export function Exporter() {

    const [informer] = useLocalStorage<Informante>('informante', EXAMPLE_DATA.informante);
    const [incomes] = useLocalStorage<Ingreso[]>('ingresos', []);
    const [expenses] = useLocalStorage<Egreso[]>('egresos', []);
    const [identity] = useLocalStorage<Identificacion>('identificacion', EXAMPLE_DATA.identificacion);
    const [family] = useLocalStorage<Familiar[]>('identificacion', []);

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

    function downloadIncomesExcel() {
        new SETExporter().downloadExcel(incomes!);
    }

    function downloadExpensesExcel() {
        new SETExporter().downloadExcel(incomes!);
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
                    <small>Exportar todos los datos, útil para importarlos al Aranduka y
                        para mantener un backup </small>
                </td>
                <td style={{verticalAlign: 'bottom'}}>
                    <Button onClick={downloadAll} style={{width: '100%'}}>Exportar</Button>
                </td>
            </tr>
            <tr>
                <td>
                    <b>Ingresos en excel</b>
                    <br/>
                    <small>Exportar todos los ingresos, en formato excel para su manipulación</small>
                </td>
                <td style={{verticalAlign: 'bottom'}}>
                    <Button onClick={downloadIncomesExcel} style={{width: '100%'}}>Descargar excel</Button>
                </td>
            </tr>
            <tr>
                <td>
                    <b>Egresos en excel</b>
                    <br/>
                    <small>Exportar todos los egresos, en formato excel para su manipulación</small>
                </td>
                <td style={{verticalAlign: 'bottom'}}>
                    <Button onClick={downloadExpensesExcel} style={{width: '100%'}}>Descargar excel</Button>
                </td>
            </tr>
            </tbody>
        </table>

    </Row>
}
