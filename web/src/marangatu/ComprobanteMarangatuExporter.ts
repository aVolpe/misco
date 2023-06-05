import {Expense} from '../set/Model';
import Papa from 'papaparse';
import {ExpenseDocumentType, ExpenseIdentifierType} from '../set/V2Enums';
import {SETService} from '../set/SETService';
import dayjs from 'dayjs';
import JSZip from 'jszip';

export interface ExportData {
    type: 'MENSUAL' | 'ANUAL',
    fileName: string;
    data: string,
    lastIdentifier: number;
}

export async function doExportToZip(
    identifier: string,
    date: Date,
    type: ExportData['type'],
    lastIdentifier: number,
    expenses: Expense[]
): Promise<{ blob: Blob, lastIdentifier: number, fileName: string }> {
    const data = doExport(identifier, date, type, lastIdentifier, expenses);
    const zip = new JSZip();
    zip.file(data.fileName + ".csv", data.data);
    const b = await zip.generateAsync({type: 'blob'});
    return {blob: b, lastIdentifier: data.lastIdentifier, fileName: data.fileName + ".zip"};
}

/**
 * Generates
 */

export function doExport(
    identifier: string,
    date: Date,
    type: ExportData['type'],
    lastIdentifier: number,
    expenses: Expense[]
): ExportData {

    const rows: string = exportExpenses(expenses);

    return {
        type: type,
        fileName: type === 'MENSUAL'
            ? `${identifier}_REG_${dayjs(date).format("MMYYYY")}_${(lastIdentifier + 1).toString().padStart(5, '0')}`
            : `${identifier}_REG_${dayjs(date).format("YYYY")}_${(lastIdentifier + 1).toString().padStart(5, '0')}`,
        data: rows,
        lastIdentifier: lastIdentifier + 1
    }
}

function exportExpenses(expenses: Expense[]) {
    return Papa.unparse(expenses.map(e => ([
        4,
        mapExpenseType(e.type),
        mapExpenseDate(e),
        e.type === 'ips' ? null : e.voucher,
        mapIdentifierType(e.identifierType),
        e.identifier,
        e.name,
        e.amount,
        'N', // iva
        'N', // ire
        'S', // irp-rsp
        'N', // no imputa
        null, // numero de cuenta
        null, // banco/financiera/cooperativa
        e.type === 'ips' ? 292994 : null, // identificacion empleador ips
        null, // especificar tipo de documento
        null, // numero del comprobante de compra asociado
        null, // timbrado del comprobante asociado
    ])));
}


/**
 * View table 4 of `Especificación Técnica para Importación.pdf`
 */
function mapExpenseType(
    type: keyof typeof ExpenseDocumentType
): number {
    if (type === 'invoice') return 109;
    if (type === 'ips') return 206;
    throw new Error(`Unmapped type ${type}`);
}

/**
 * • Requerido.
 * • Formato de fecha dd/mm/aaaa, a excepción
 * de los tipos de comprobantes 208 (LIQUIDACIÓN DE SALARIO) Y 206 (EXTRACTO DE CUENTA DE IPS), en los cuales se debe consignar el periodo con formato mm/aaaa.
 * • No se permiten fechas anteriores al 01/01/2021.
 */
function mapExpenseDate(
    e: Expense
): string {
    if (e.type === 'invoice') return SETService.mapLocalToMoment(e.date).format('DD/MM/YYYY');
    if (e.type === 'ips') return SETService.mapLocalToMoment(e.date).format('MM/YYYY');
    throw new Error(`Unmapped type ${e.type} (${e.id})`);
}

/**
 * View table 3 of `Especificación Técnica para Importación.pdf`
 * @param identifierType
 */
function mapIdentifierType(identifierType: keyof typeof ExpenseIdentifierType) {
    switch (identifierType) {
        case 'ruc':
            return 11;
        case 'migrationDocument':
            throw new Error(`unsupported type for export ${identifierType}`);
        case 'passport':
            return 13;
        case 'document':
            return 12;
        case 'externalProviderIdentifier':
            return 16;
        case 'employerNumber':
            throw new Error(`unsupported type for export ${identifierType}`);

    }
}


const VENTAS_COLUMNS = [
    "CÓDIGO TIPO DE REGISTRO",
    "CÓDIGO TIPO DE IDENTIFICACIÓN DEL COMPRADOR",
    "NÚMERO DE IDENTIFICACIÓN DEL COMPRADOR",
    "NOMBRE O RAZÓN SOCIAL DEL COMPRADOR",
    "CÓDIGO TIPO DE COMPROBANTE",
    "FECHA DE EMISIÓN DEL COMPROBANTE",
    "NÚMERO DE TIMBRADO",
    "NÚMERO DEL COMPROBANTE",
    "MONTO GRAVADO AL 10% (IVA INCLUIDO)",
    "MONTO GRAVADO AL 5% (IVA INCLUIDO)",
    "MONTO NO GRAVADO O EXENTO",
    "MONTO TOTAL DEL COMPROBANTE",
    "CÓDIGO CONDICIÓN DE VENTA",
    "OPERACIÓN EN MONEDA EXTRANJERA",
    "IMPUTA AL IVA",
    "IMPUTA AL IRE",
    "IMPUTA AL IRP-RSP",
    "NÚMERO DEL COMPROBANTE DE VENTA ASOCIADO",
    "TIMBRADO DEL COMPROBANTE DE VENTA ASOCIADO"];

const EGRESOS_COLUMNS = [
    "CÓDIGO TIPO DE REGISTRO",
    "CÓDIGO TIPO DE COMPROBANTE",
    "FECHA DE EMISIÓN O PERIODO DEL COMPROBANTE",
    "NÚMERO DEL COMPROBANTE/ N° DE TRANSACCIÓN",
    "CÓDIGO TIPO DE IDENTIFICACIÓN DEL VENDEDOR/PROVEEDOR/ EMPLEADO/RECEPTOR DEL PAGO",
    "NÚMERO DE IDENTIFICACIÓN DEL VENDEDOR/ PROVEEDOR/ EMPLEADO/ /RECEPTOR DEL PAGO",
    "NOMBRE O RAZÓN SOCIAL DEL VENDEDOR/ PROVEEDOR/ EMPLEADO/ DESCRIPCIÓN DEL BIEN O SERVICIO",
    "MONTO TOTAL DEL COMPROBANTE",
    "IMPUTA AL IVA",
    "IMPUTA AL IRE",
    "IMPUTA AL IRP-RSP",
    "NO IMPUTA",
    "NÚMERO DE CUENTA / NÚMERO DE TARJETA",
    "BANCO/ FINANCIERA/ COOPERATIVA",
    "NÚMERO IDENTIFICACIÓN DEL EMPLEADOR (IPS)",
    "ESPECIFICAR TIPO DE DOCUMENTO",
    "NÚMERO DEL COMPROBANTE DE VENTA ASOCIADO",
    "TIMBRADO DEL COMPROBANTE DE VENTA ASOCIADO"];