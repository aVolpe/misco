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
    if (text.includes('Servicios de Banda Ancha')) return [tigoWifiParser(text)]
    if (text.includes('TELEFÓNICA CELULAR DEL PARAGUAY S.A.E.')) return [tigoTelefParser(text)]

    console.log("No template found, returning undefined");
    return undefined;
}

function tigoWifiParser(text: string): Partial<ParseResult> {

    (window as any).text = text;
    const letterHeadPattern = /Timbrado N°:*:\s+(\d+)/
    const totalPattern = /FAC .* (.*)\n/
    const datePattern = /(\d\d\/\d\d\/\d\d\d\d)\n/
    const identifierPattern = /FAC (.*) .*\n/

    const letterHeadMatches = letterHeadPattern.exec(text);
    const totalMatches = totalPattern.exec(text);
    const dateMatches = datePattern.exec(text);
    const identifierMatches = identifierPattern.exec(text);

    console.log(dateMatches);
    const ruc = "80000519";
    console.log(ruc)

    return {
        type: 'invoice', // tigo is always factura,
        condition: 'credit', // is always credit
        letterhead: letterHeadMatches ? parseInt(letterHeadMatches[1]) : undefined,
        ruc,
        total: totalMatches ? parseInt(totalMatches[1]
            .replace(/\./, '')
            .replace(/\s/, '')
        ) : undefined,
        date: dateMatches ? moment(dateMatches[1], "DD-MM-YYYY").format("YYYY/MM/DD") : undefined,
        identifier: identifierMatches ? identifierMatches[1] : undefined,
        owner: ruc ? {
            name: 'TELEFÓNICA CELULAR DEL PARAGUAY S.A.E',
            doc: ruc,
            div: new DigitGenerator().getDigitoVerificadorBase11(ruc) + ""
        } : undefined
    }
}

/**
 * Since april 2022, tigo emits virtual invoices, so this should be only used for older invoices.
 */
function tigoTelefParser(text: string): Partial<ParseResult> {

    const letterHeadPattern = /Timbrado.*:\s+(\d+)/
    const rucPattern = /RUC\s*:\s+(\d+)-\d/
    const totalPattern = /TOTAL A PAGAR .*Gs. (.*)\n/
    const datePattern = /Fecha de emisión: (.*)\n/
    const conditionPattern = /Condición de Venta: Contado\((.*)\) Crédito\((.*)\)\s*\n/
    const identifierPattern = /Nro. de factura: (.*)\n/

    const letterHeadMatches = letterHeadPattern.exec(text);
    const rucMatches = rucPattern.exec(text);
    const totalMatches = totalPattern.exec(text);
    const dateMatches = datePattern.exec(text);
    const conditionMatches = conditionPattern.exec(text);
    const identifierMatches = identifierPattern.exec(text);

    console.log(dateMatches);
    const ruc = rucMatches ? rucMatches[1] : undefined;
    console.log(ruc)

    return {
        type: 'invoice', //muv is always factura,
        condition: extractConditionType(conditionMatches),
        letterhead: letterHeadMatches ? parseInt(letterHeadMatches[1]) : undefined,
        ruc,
        total: totalMatches ? parseInt(totalMatches[1]
            .replace(/\./, '')
            .replace(/\s/, '')
        ) : undefined,
        date: dateMatches ? moment(dateMatches[1], "DD-MM-YYYY").format("YYYY/MM/DD") : undefined,
        identifier: identifierMatches ? identifierMatches[1] : undefined,
        owner: ruc ? {
            name: 'TELEFÓNICA CELULAR DEL PARAGUAY S.A.E',
            doc: ruc,
            div: new DigitGenerator().getDigitoVerificadorBase11(ruc) + ""
        } : undefined
    }
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
