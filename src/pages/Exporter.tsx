import React, {useState} from 'react';
import {useLocalStorage} from '@rehooks/local-storage';
import {App, Button, Col, DatePicker, Input, Row, Space} from 'antd';
import {Expense, Income, User} from "../set/Model";
import {SETExporter} from "../set/SETExporter";
import dayjs, {Dayjs} from 'dayjs';
import {SETListManipulatorService} from '../set/SETListManipulatorService';
import {doExportToZip} from '../marangatu/ComprobanteMarangatuExporter';
import FileSaver from 'file-saver';
import {TagBar} from '../tags/MiscoTag';

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

    function downloadRequirement(date: Dayjs, type: 'MENSUAL' | 'ANUAL', query: string, tags: string[]) {
        message.loading({content: 'Obteniendo registros', key: '955'});
        const filteredExpenses = new SETListManipulatorService()
            .filterAll(
                expenses,
                incomes,
                query,
                date.startOf(type === 'MENSUAL' ? 'month' : 'year'),
                date.endOf(type === 'MENSUAL' ? 'month' : 'year'),
                tags);
        console.log(`${type} - Query: ${query} - Period ${date} - To export: ${filteredExpenses.incomes.length} incomes and ${filteredExpenses.expenses.length} expenses`);

        const size = filteredExpenses.incomes.length + filteredExpenses.expenses.length;

        message.loading({content: `Generando archivo con ${size} registros`, key: '955'});
        const identifier = informer?.identifier!;
        return doExportToZip(identifier.substring(0, identifier.indexOf('-')), date.toDate(), type, marangatuExportData, filteredExpenses)
            .then(z => {
                message.loading({content: `Descargando ${z.fileName} de ${size} registros`, key: '955'});
                setMarangatuExportData(z.lastIdentifier);
                FileSaver.saveAs(z.blob, z.fileName);
                return z.fileName;
            })
            .then(fn => {
                message.success({content: `Archivo ${fn} guardado (con ${size} registros)`, key: '955', duration: 5});
            })
            .catch(e => {
                console.warn(e);
                message.error({
                    content: `No se puede guardar el archivo (${e}) (con ${size} registros)`,
                    key: '955',
                    duration: 15
                });
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
            <Space direction="vertical">
                <h3>
                    Exportar datos para el sistema Marangatu.
                </h3>
                <Download955 download955={(d, query, tags) => downloadRequirement(d, 'MENSUAL', query, tags)}/>
                <Download956 download956={(d, query, tags) => downloadRequirement(d, 'ANUAL', query, tags)}/>
            </Space>
        </Col>

    </Row>
}

function Download955(props: Readonly<{
    download955: (d: Dayjs, query: string, tags: string[]) => void
}>) {
    const [date, setDate] = useState(dayjs().add(-1, 'm'));
    const [query, setQuery] = useState('');
    const [tags, setTags] = useState<string[]>([]);

    return <Row gutter={[8, 8]} style={{
        border: '1px solid #c4c4c4',
        borderRadius: 10,
        padding: 5
    }}>
        <Col>
            <b>Obligación 955 - Registro mensual de comprobantes</b><br/>
            <small>Todos los comprobantes, para ser importados a Marangatu</small>
        </Col>
        <Col span={16}>
            <Input value={query}
                   placeholder="Filtro opcional"
                   onChange={e => setQuery(e.target.value)} style={{width: '100%'}}/>
        </Col>
        <Col span={8}>
            <DatePicker value={date}
                        style={{width: '100%'}}
                        onChange={d => setDate(d!)}
                        format={monthFormat}
                        picker="month"/>
        </Col>
        <Col>
            <TagBar onChanged={setTags}/>
        </Col>
        <Col span={24}>
            <Button onClick={() => props.download955(date, query, tags)} style={{width: '100%'}}>Exportar</Button>
        </Col>
    </Row>
}

function Download956(props: Readonly<{
    download956: (d: Dayjs, query: string, tags: string[]) => void
}>) {
    const [date, setDate] = useState(dayjs().add(-1, 'y'));
    const [query, setQuery] = useState('');
    const [tags, setTags] = useState<string[]>([]);

    return <Row gutter={[8, 8]} style={{
        border: '1px solid #c4c4c4',
        borderRadius: 10,
        padding: 5
    }}>
        <Col>
            <b>Obligación 956 - Registro Anual de Comprobantes</b><br/>
            <small>Todos los comprobantes, para ser importados a Marangatu</small>
        </Col>
        <Col span={16}>
            <Input value={query}
                   placeholder="Filtro opcional"
                   onChange={e => setQuery(e.target.value)} style={{width: '100%'}}/>
        </Col>
        <Col span={8}>
            <DatePicker value={date}
                        style={{width: '100%'}}
                        onChange={d => setDate(d!)}
                        format={monthFormat}
                        picker="month"/>
        </Col>
        <Col>
            <TagBar onChanged={setTags}/>
        </Col>
        <Col span={24}>
            <Button onClick={() => props.download956(date, query, tags)} style={{width: '100%'}}>Exportar</Button>
        </Col>
    </Row>
}
