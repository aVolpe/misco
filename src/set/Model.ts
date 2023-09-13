import {ExpenseDocumentType, ExpenseIdentifierType, IncomeOriginDocumentType, IncomeType, PaymentType} from './V2Enums';
import {PersonType} from "./ParametroEgreso";
import {Egreso, Informante, Ingreso} from "./ArandukaModel";


export interface User {
    version: 2;
    identifier: string;
    name: string;
    type: PersonType;

    older?: {
        v1: Informante
    }
}

/**
 * Based on the latest model for the 2021
 */
export interface Income {

    version: 2;
    id: number;

    /**
     * Identifier type of the provider
     */
    identifierType: keyof typeof IncomeOriginDocumentType;
    /**
     * Identifier of the provider (ruc number or document)
     */
    identifier: string;

    name: string;

    type: keyof typeof IncomeType;

    /**
     * The identifier of this income
     */
    voucher?: string;
    /**
     * The letterhead of this income
     */
    letterhead?: string;

    /**
     * Date in format YYYY-MM-DD
     */
    date: string;

    amount: number;

    irpAmount: number;

    /**
     * payment type
     */
    paymentType: keyof typeof PaymentType;

    older?: {
        v1: Ingreso
    },

    tags?: Array<string>
}

export interface Expense {

    version: 2;
    id: number;

    /**
     * The type of the identifier of the provider
     */
    identifierType: keyof typeof ExpenseIdentifierType;

    /**
     * The identifier of the provider
     */
    identifier: string;
    /**
     * The letterhead of the provider
     */
    letterhead?: string;

    /**
     * The name of the provider
     */
    name: string;

    type: keyof typeof ExpenseDocumentType;


    /**
     * The identifier of this expense
     */
    voucher?: string;

    paymentType: keyof typeof PaymentType;

    /**
     * Date in format YYYY-MM-DD
     */
    date: string;

    amount: number;

    irpAmount: number;

    older?: {
        v1: Egreso
    };

    tags?: Array<string>
}


export interface FullData {
    version: 2;
    user: User;
    incomes: Income[];
    expenses: Expense[];
}
