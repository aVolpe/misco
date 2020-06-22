import {PersonType} from './ParametroEgreso';

export const INGRESO_TYPES: { [k: string]: string } = {
    "HPRSP": "Honorarios Profesionales y otras remuneraciones percibidas por servicios personales",
    "HPR": "Honorarios Profesionales y otras remuneraciones percibidas",
    "DU": "Dividendos y utilidades",
    "VO": "Venta Ocasional de Inmuebles, cesión de derechos, venta de títulos, acciones, cuotas de capital y similares",
    "IPCMI": "Intereses, comisiones o rendimientos de Capitales Mobiliarios e Inmobiliarios (Ej.: Venta de Bienes Muebles; Alquiler de Muebles e Inmuebles)",
    "OI": "Otros Ingresos Gravados o No Gravados por el IRP",
    "IPCM": "Intereses, Comisiones o Rendimientos de Capitales Mobiliarios",
    "VIAT": "Viáticos",
    "REMDEP": "Salarios y cualquier otra remuneración obtenida en relación de dependencia",
    "AGUI": "Aguinaldo",
    "RET": "Jubilaciones, pensiones y haberes de retiro",
    "INDEM": "Indemnizaciones por causa de muerte o incapacidad total o parcial, por enfermedad, por maternidad, por accidente o por despido",
    "PREMIO": "Premios en dinero  ganados en juegos de azar o en concursos",
    "LH": "Legados y Herencias",
    "BIENDIS": "Dinero adjudicado en disolución conyugal (Ej. Cheques, depósitos, transferencias)",
    "EXCEDE": "Excedentes"
};

export const INGRESO_STATIC_DATA: {
    [k in PersonType]: Array<{
        codigo: string;
        nombre: string;
        opciones: Array<string>;
    }>
} = {
    "SOCIEDAD_SIMPLE": [{
        "codigo": "1",
        "nombre": "Factura",
        "opciones": ["HPR", "VO", "IPCMI", "OI"]
    }, {
        "codigo": "4",
        "nombre": "Nota de Crédito",
        "opciones": ["HPR", "VO", "IPCMI", "OI"]
    }, {
        "codigo": "8",
        "nombre": "Extracto de Cuenta (cuando no exista la obligación de emitir comprobantes de venta)",
        "opciones": ["IPCM", "OI"]
    }, {
        "codigo": "14",
        "nombre": "Otros Documentos que respaldan los ingresos (cuando no exista la obligación de emitir comprobantes de venta)",
        "opciones": ["OI"]
    }],
    "FISICO": [{
        "codigo": "1",
        "nombre": "Factura",
        "opciones": ["HPRSP", "DU", "VO", "IPCMI", "OI"]
    }, {
        "codigo": "4",
        "nombre": "Nota de Crédito",
        "opciones": ["HPRSP", "DU", "VO", "IPCMI", "OI"]
    }, {
        "codigo": "5",
        "nombre": "Liquidación de Salario",
        "opciones": ["REMDEP", "AGUI"]
    }, {
        "codigo": "8",
        "nombre": "Extracto de Cuenta (cuando no exista la obligación de emitir comprobantes de venta)",
        "opciones": ["RET", "INDEM", "IPCM", "OI", "EXCEDE"]
    }, {
        "codigo": "14",
        "nombre": "Otros Documentos que respaldan los ingresos (cuando no exista la obligación de emitir comprobantes de venta)",
        "opciones": ["RET", "INDEM", "PREMIO", "LH", "BIENDIS", "OI", "VIAT"]
    }]
}
