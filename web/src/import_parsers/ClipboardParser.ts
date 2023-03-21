import {ExpenseDocumentType, PaymentType} from '../set/V2Enums';
import moment from 'moment';
import {Person} from '../RucAPI';
import DigitGenerator from '../set/DigitGenerator';

export interface ParseResult {
    type: keyof typeof ExpenseDocumentType;
    letterhead: number;
    identifier: string;
    ruc: string;
    date: string;
    condition: keyof typeof PaymentType;
    total: number;
    owner: Person;
}


export function parseClipboard(text: string): Array<Partial<ParseResult>> | undefined {

    if (!text || text.length === 0) return undefined;

    if (text.includes('www.muv-app.co')) return [muvParser(text)];
    if (text.includes('"datos":[{')) return marangatuImportVirtualParser(text);

    console.log("No template found, returning undefined");
    return undefined;
}

type MarangatuImportVirtual = {
    datos: Array<{
        documento: number,
        rucVendedor: number,
        nombreVendedor: string,
        rucComprador: number,
        nombreComprador: string,
        tipoComprobanteCodigo: string,
        tipoComprobante: 'FACTURA ELECTRÓNICA' | 'FACTURA' | 'OTHER',
        timbrado: number,
        tipoRegistro: unknown,
        tipoDocumento: unknown,
        fechaExpedicionComprobante: string,
        tipoIdentificacion: string,
        numeroIdentificacion: number,
        misionDiplomatica: unknown,
        numeroComprobante: string,
        importeIva10: number,
        importeIva5: number
        importeExenta: number
        iva10: number,
        iva5: number
        importeTotal: number,
        totalIva?: number,
        totalImporteSinIva?: number,
        condicionCompra: 'Contado' | 'Credito',
        cantidadCuotas: unknown,
        elegido: unknown,
        formaPresentacion: 'ELECTRÓNICO',
        tipoIdentificacionInformado: 'RUC',
        nombreInformado: unknown,
        tipoIdentificadorVendedor: 'RUC',
        tipoIdentificadorComprador: 'RUC'
    }>
}

function marangatuImportVirtualParser(text: string): ParseResult[] {
    const parsed = JSON.parse(text) as MarangatuImportVirtual;
    const digit = new DigitGenerator();

    return parsed?.datos?.map(d => {
        if (!(['FACTURA ELECTRÓNICA', 'FACTURA'].includes(d.tipoComprobante))) throw new Error(`Unknown type ${d.tipoComprobante}`)
        return {
            date: moment(d.fechaExpedicionComprobante, "DD/MM/YYYY").format("YYYY/MM/DD"),
            condition: d.condicionCompra === 'Contado' ? 'cash' : 'credit',
            identifier: d.numeroComprobante,
            letterhead: d.timbrado,
            ruc: d.rucVendedor + "",
            type: 'invoice',
            total: d.importeTotal,
            owner: {
                doc: d.rucVendedor + "",
                div: digit.getDigitoVerificadorBase11(d.rucVendedor + "") + "",
                name: d.nombreVendedor
            }
        }
    }) || [];
}


export function muvParser(text: string): Partial<ParseResult> {

    const letterHeadPattern = /Timbrado.*:\s+(\d+)/
    const rucPattern = /RUC\s*:\s+(\d+)-\d/
    const totalPattern = /Total a pagar: Gs. .*- Gs. (.*)\n/
    const datePattern = /Fecha: (.*)\n/
    const conditionPattern = /Condición de Venta: Contado\((.*)\) Crédito\((.*)\)\s*\n/
    const identifierPattern = /Factura N°: (.*)\n/

    const letterHeadMatches = letterHeadPattern.exec(text);
    const rucMatches = rucPattern.exec(text);
    const totalMatches = totalPattern.exec(text);
    const dateMatches = datePattern.exec(text);
    const conditionMatches = conditionPattern.exec(text);
    const identifierMatches = identifierPattern.exec(text);

    console.log(dateMatches);

    return {
        type: 'invoice', //muv is always factura,
        condition: extractConditionType(conditionMatches),
        letterhead: letterHeadMatches ? parseInt(letterHeadMatches[1]) : undefined,
        ruc: rucMatches ? rucMatches[1] : undefined,
        total: totalMatches ? parseInt(totalMatches[1]
            .replace(/\./, '')
            .replace(/\s/, '')
        ) : undefined,
        date: dateMatches ? moment(dateMatches[1], "DD-MM-YYYY").format("YYYY/MM/DD") : undefined,
        identifier: identifierMatches ? identifierMatches[1] : undefined,
    }
}

function extractConditionType(conditionMatches: RegExpExecArray | null): ParseResult["condition"] | undefined {
    if (!conditionMatches) return undefined;
    return conditionMatches[1].trim() === 'X'
        ? 'cash'
        : 'credit';
}
