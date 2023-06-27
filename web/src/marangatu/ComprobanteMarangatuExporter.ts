import {Expense, Income} from '../set/Model';
import Papa from 'papaparse';
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
    raw: { expenses: Expense[], incomes: Income[] }
): Promise<{ blob: Blob, lastIdentifier: number, fileName: string }> {
    const data = doExport(identifier, date, type, lastIdentifier, raw);
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
    raw: { expenses: Expense[], incomes: Income[] }
): ExportData {

    let expenses = exportExpenses(raw.expenses);
    if (expenses.length > 0 && !expenses.endsWith("\n")) expenses += "\n";
    const rows: string = expenses + exportIncomes(raw.incomes);

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
    return Papa.unparse(expenses.map(e => mapExpense(e)).sort((r1, r2) => r1[0] - r2[0]));
}

function exportIncomes(incomes: Income[]) {
    return Papa.unparse(incomes.map(e => mapIncome(e)).sort((r1, r2) => r1[0] - r2[0]));
}


function mapExpense(e: Expense): any[] {

    const type = getDocumentType(e);

    if (type === 'COMPRA') {
        return [
            2, // 1
            mapIdentifierType(e), // 2
            e.identifier, // 3
            mapName(e), // 4
            mapExpenseType(e), // 5
            mapExpenseDate(e), // 6
            e.letterhead, // 7
            e.voucher, // 8
            e.amount, // 9
            0, // 10
            0, // 11
            e.amount, // 12
            1, // CONIDICION DE COMPRA 13
            'N',
            'N',
            'N',
            'S',
            'N',
            undefined,
            undefined
        ]
    }
    return [
        4, // 1
        mapExpenseType(e), // 2
        mapExpenseDate(e), // 3
        e.type === 'ips' || e.type === 'cardSummary' || e.type === 'salary' ? null : e.voucher, // 4
        mapIdentifierType(e), // 5
        e.type === 'cardSummary' ? null : e.identifier, // 6
        mapName(e), // 7
        e.amount, // 8
        'N', // iva
        'N', // ire
        'S', // irp-rsp
        'N', // no imputa
        null, // numero de cuenta
        null, // banco/financiera/cooperativa
        mapIpsEmployerIdentifier(e),// identificacion empleador ips
        null, // especificar tipo de documento
        null, // numero del comprobante de compra asociado
        null, // timbrado del comprobante asociado
    ];
}

function mapIncome(i: Income): any[] {
    if (i.type !== 'salary') throw new Error(`missing mapping for type ${i.type}`);
    return [
        3, // 1
        mapIncomeType(i), // 2
        mapIncomeDate(i), // 3
        i.type === 'salary' ? null : i.voucher, // 4
        mapIdentifierType(i), // 5
        i.identifier, // 6
        mapName(i), // 7
        i.amount, // MONTO GRAVADO 8
        0, // MONTO NO GRAVADO/EXONERADO 9
        i.amount, // MONTO TOTAL 10
        'N', // IRE 11
        'S', // IRP-RSP 12
        null, // ESPECIFICAR TIPO DE DOCUMENTO 13
        null, // NUMERO DE COMPROBANTE DE VENTA ASOCIADO 14
        null // TIMBRADO DEL COMPROBANTE DE VENTA ASOCIADO 15
    ]
}

function getDocumentType(e: Expense) {
    if (e.type === 'invoice') return 'COMPRA';
    return 'EGRESO';
}

function mapName(e: Expense | Income) {
    if (e.type === 'ips') return null;
    if (e.type === 'salary') return e.name; // always put name if salary
    if (e.identifierType === 'ruc') return null;
    if (e.identifierType === 'document') return null;
    return e.name;
}

/**
 * View table 4 of `Especificación Técnica para Importación.pdf`
 */
function mapExpenseType(
    e: Expense
): number {
    if (e.type === 'invoice') return 109;
    if (e.type === 'ips') return 206;
    if (e.type === 'salary') return 208;
    if (e.type === 'publicIncomeTicket') return 204;
    if (e.type === 'cardSummary') return 207;
    throw new Error(`Unmapped type ${e.type} (${e.id})`);
}

function mapIncomeType(
    i: Income
): number {
    if (i.type === 'salary') return 208;
    throw new Error(`Unmapped type ${i.type}`);
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
    if (e.type === 'invoice'
        || e.type === 'publicIncomeTicket'
        || e.type === 'cardSummary') return SETService.mapLocalToMoment(e.date).format('DD/MM/YYYY');
    if (e.type === 'ips'
        || e.type === 'salary') return SETService.mapLocalToMoment(e.date).format('MM/YYYY');
    throw new Error(`Unmapped type ${e.type} (${e.id})`);
}

/**
 * • Requerido.
 * • Formato de fecha dd/mm/aaaa, a excepción
 * de los tipos de comprobantes 208 (LIQUIDACIÓN DE SALARIO) Y 206 (EXTRACTO DE CUENTA DE IPS), en los cuales se debe consignar el periodo con formato mm/aaaa.
 * • No se permiten fechas anteriores al 01/01/2021.
 */
function mapIncomeDate(
    i: Income
): string {
    if (i.type === 'salary') return SETService.mapLocalToMoment(i.date).format('MM/YYYY');
    throw new Error(`Unmapped type ${i.type} (${i.id})`);
}

/**
 * View table 3 of `Especificación Técnica para Importación.pdf`
 */
function mapIdentifierType(e: Expense | Income): number | null {
    if (e.type === 'ips'
        || e.type === 'cardSummary') return null;
    if (e.type === 'publicIncomeTicket') return 11; // always ruc
    switch (e.identifierType) {
        case 'ruc':
            return 11;
        case 'migrationDocument':
            throw new Error(`unsupported type for export ${e.identifierType} (${e.id})`);
        case 'passport':
            return 13;
        case 'document':
            return 12;
        case 'externalProviderIdentifier':
            return 16;
        case 'employerNumber':
        default:
            throw new Error(`unsupported type for export ${e.identifierType} (${e.id})`);
    }
}

function mapIpsEmployerIdentifier(e: Expense) {
    if (e.type !== 'ips') return null;
    return e.type === 'ips' ? 292994 : null;
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

