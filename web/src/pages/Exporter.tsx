import React from 'react';
import {useLocalStorage} from '@rehooks/local-storage';
import {Button, Col, Row} from 'antd';
import {Expense, Income, User} from "../set/Model";
import {SETExporter} from "../set/SETExporter";

export function Exporter() {

    const [informer] = useLocalStorage<User>('informante');
    const [incomes] = useLocalStorage<Income[]>('ingresos', []);
    const [expenses] = useLocalStorage<Expense[]>('egresos', []);

    function downloadAll() {
        new SETExporter().downloadAll(informer!, {informer, incomes, expenses});
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

    </Row>
}

