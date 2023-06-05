import {ArandukaExport, Egreso, Informante, Ingreso} from "./ArandukaModel";
import {Expense, FullData, Income, User} from "./Model";
import {SETService} from "./SETService";


/**
 * This class can map any version of the data to the latest one used
 * in the system.
 */
export class VersionMigrator {

    public migrate(base: ArandukaExport): FullData {

        return {
            version: 2,
            user: this.migrateUser(base.informante),
            expenses: base.egresos.map(this.migrateExpense),
            incomes: base.ingresos.map(this.migrateIncome)
        }
    }

    needsMigration(param: any): boolean {
        return !param || !param.version || param.version !== 2;
    }

    anyNeedsMigration(param: any[]): boolean {
        return !param
            || !!param.find(p => this.needsMigration(p));
    }

    public migrateUser(base: Informante | User | undefined | null | string): User {
        if (base === null || base === undefined || typeof base === 'string') return {
            version: 2,
            identifier: '0-0',
            name: 'EMPY',
            type: 'FISICO'
        };
        if ('version' in base) return base;
        return {
            version: 2,
            identifier: base.ruc,
            name: base.nombre,
            type: "FISICO",
            older: {
                v1: base
            }
        }
    }

    public migrateIncome(base: Ingreso | Income): Income {
        if ('version' in base) return base;
        return {
            version: 2,
            id: base.id,
            amount: base.ingresoMontoTotal,
            date: SETService.mapDateFromSetFormat(base.fecha!),
            identifier: base.relacionadoNumeroIdentificacion,
            identifierType: 'ruc',
            irpAmount: 0,
            name: base.relacionadoNombres,
            type: "salary",
            voucher: base.timbradoDocumento,
            paymentType: base.tipoIngreso === "credito" ? 'credit' : 'cash',
            letterhead: base.timbradoNumero,

            older: {
                v1: base
            }
        };
    }

    public migrateExpense(base: Egreso | Expense): Expense {
        if ('version' in base) return base;
        return {
            version: 2,
            id: base.id,
            amount: base.egresoMontoTotal,
            date: SETService.mapDateFromSetFormat(base.fecha),
            identifier: base.relacionadoNumeroIdentificacion,
            identifierType: 'ruc',
            letterhead: base.timbradoNumero,
            name: base.relacionadoNombres,
            voucher: base.timbradoDocumento,
            irpAmount: 0,
            type: 'invoice', // TODO improve mapping
            paymentType: base.timbradoCondicion === 'contado' ? 'cash' : 'credit',

            older: {
                v1: base
            }
        }
    }

}
