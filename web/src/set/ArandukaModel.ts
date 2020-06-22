import {PersonType} from './ParametroEgreso';

export interface Obligacion {
    impuesto: number;
    nombre: string;
    fechaDesde: string;
}

export interface Informante {
    ruc: string;
    dv: string;
    nombre: string;
    tipoContribuyente: PersonType;
    tipoSociedad?: string | null;
    nombreFantasia?: string | null;
    obligaciones: Obligacion[];
    clasificacion: string;
}

export type PresentationType = 'ORIGINAL'|'RECTIFICATIVA';

export interface Identificacion {
    periodo: string;
    tipoMovimiento: string;
    tipoPresentacion: PresentationType;
    version: string;
}

export interface Ingreso {
    tipo: string;
    periodo: string;
    tipoTexto: string;
    fecha: string;
    mes?: string;
    ruc: string;
    tipoIngreso: string;
    tipoIngresoTexto: string;
    id: number;
    ingresoMontoGravado: number;
    ingresoMontoNoGravado: number;
    ingresoMontoTotal: number;
    timbradoCondicion?: string;
    timbradoDocumento?: string;
    timbradoNumero?: string;
    relacionadoTipoIdentificacion: string;
    relacionadoNumeroIdentificacion: string;
    relacionadoNombres: string;
}

export interface Egreso {
    periodo: string;
    tipo: string;
    relacionadoTipoIdentificacion: string;
    fecha: string;
    id: number;
    ruc: string;
    egresoMontoTotal: number;
    relacionadoNombres: string;
    // RUC emisor
    relacionadoNumeroIdentificacion: string;
    timbradoCondicion?: string;
    timbradoDocumento?: string;
    timbradoNumero?: string;
    tipoEgreso: string;
    tipoEgresoTexto: string;
    tipoTexto: string;
    subtipoEgreso: string;
    subtipoEgresoTexto: string;
    mes?: string;
}

export interface Familiar {
    identificacion: string;
    nombre: string;
    regimen: string;
    regimenTexto: string;
    vinculo: string;
    vinculoTexto: string;
    ruc: string;
    periodo: string;
}

export interface ArandukaExport {
    informante: Informante;
    identificacion: Identificacion;
    ingresos: Ingreso[];
    egresos: Egreso[];
    familiares: Familiar[];
}

