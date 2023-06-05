import React, {useState} from 'react';
import {useLocalStorage} from '@rehooks/local-storage';
import {App, Button, Col, DatePicker, Row} from 'antd';
import {Expense, Income, User} from "../set/Model";
import {SETExporter} from "../set/SETExporter";
import dayjs, {Dayjs} from 'dayjs';
import {SETListManipulatorService} from '../set/SETListManipulatorService';
import {doExportToZip} from '../marangatu/ComprobanteMarangatuExporter';
import FileSaver from 'file-saver';

const monthFormat = 'MM/YYYY';

export function Exporter() {

    const [informer] = useLocalStorage<User>('informante');
    const [incomes] = useLocalStorage<Income[]>('ingresos', []);
    const [expenses] = useLocalStorage<Expense[]>('egresos', []);
    const [marangatuExportData, setMarangatuExportData] = useLocalStorage<number>('marangatu_export_identifier', 0);
    const {message} = App.useApp();

    function downloadAll() {
        new SETExporter().downloadAll(informer!, {informer, incomes, expenses});
    }

    function downloadIncomesExcel() {
        new SETExporter().downloadExcel(informer!, 'ingresos', incomes!);
    }

    function downloadExpensesExcel() {
        new SETExporter().downloadExcel(informer!, 'egresos', expenses!);
    }

    function downloadRequirement955(date: Dayjs) {
        message.loading({content: 'Obteniendo registros', key: '955'});
        const filteredExpenses = new SETListManipulatorService()
            .filterExpenses(expenses, undefined, date.startOf('month'), date.endOf('month'));

        message.loading({content: 'Generando archivo', key: '955'});
        const identifier = informer?.identifier!;
        return doExportToZip(identifier.substring(0, identifier.indexOf('-')), date.toDate(), 'MENSUAL', marangatuExportData, filteredExpenses)
            .then(z => {
                message.loading({content: `Descargando ${z.fileName}`, key: '955'});
                setMarangatuExportData(z.lastIdentifier);
                FileSaver.saveAs(z.blob, z.fileName);
                return z.fileName;
            })
            .then(fn => {
                message.success({content: `Archivo ${fn} guardado`, key: '955', duration: 5});
            })
            .catch(e => {
                console.warn(e);
                message.error({content: `No se puede guardar el archivo`, key: '955', duration: 15});
            });
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
        <Col span={24}>
            <div style={{textAlign: 'center'}}>
                <h3>
                    Exportar datos para el sistema Marangatu.
                </h3>
            </div>
            <table style={{width: '100%'}}>
                <tbody>
                <tr>
                    <td>
                        <b>Obligación 955 - Registro mensual de comprobantes</b>
                        <br/>
                        <small>Todos lso comprobantes, para ser importados a Marangatu</small>
                    </td>
                    <Download955 download955={downloadRequirement955}/>
                </tr>
                </tbody>
            </table>
        </Col>

    </Row>
}

function Download955(props: {
    download955: (d: Dayjs) => void
}) {
    const [date, setDate] = useState(dayjs());

    return <td style={{verticalAlign: 'bottom', textAlign: 'right'}}>
        <DatePicker value={date}
                    style={{width: '100%'}}
                    onChange={d => setDate(d!)}
                    format={monthFormat}
                    picker="month"/>
        <Button onClick={() => props.download955(date)} style={{width: '100%'}}>Exportar</Button>
    </td>
}
