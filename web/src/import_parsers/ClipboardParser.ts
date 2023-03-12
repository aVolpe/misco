import {ExpenseDocumentType, PaymentType} from '../set/V2Enums';
import moment from 'moment';

export interface ParseResult {
    type: keyof typeof ExpenseDocumentType;
    letterhead: number;
    identifier: string;
    ruc: string;
    date: string;
    condition: keyof typeof PaymentType;
    total: number;
}


export function parseClipboard(text: string): Partial<ParseResult> | undefined {

    if (!text || text.length === 0) return undefined;

    if (text.includes('www.muv-app.co')) return muvParser(text);

    console.log("No template found, returning undefined");
    return undefined;
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
