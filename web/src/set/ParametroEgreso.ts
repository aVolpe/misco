export type PersonType = 'FISICO' | 'SOCIEDAD_SIMPLE';

export const EGRESO_STATIC_DATA: {
    [k in PersonType]: Array<{
        codigo: string,
        nombre: string,
        egresos: Array<{
            codigo: string,
            nombre: string,
            subtipos: string[]
        }>
    }>
} = {
    "FISICO": [{
        "codigo": "1",
        "nombre": "Factura",
        "egresos": [
            {
                "codigo": "gasto",
                "nombre": "Gasto",
                "subtipos": ["GPERS", "GACT", "DONAC", "PREST", "CUOTA", "RECPOS"]
            },
            {
                "codigo": "inversion_actividad",
                "nombre": "Inversiones Relacionadas a la Actividad Gravada",
                "subtipos": ["MEH", "INM", "EDU", "INVLF", "ACCIONES"]
            },
            {
                "codigo": "inversion_personas",
                "nombre": "Inversiones Personales y de familiares a Cargo",
                "subtipos": ["INM", "EDU", "COLOC", "SALUD"]
            }
        ]
    }, {
        "codigo": "2",
        "nombre": "Autofactura",
        "egresos": [
            {
                "codigo": "gasto",
                "nombre": "Gastos",
                "subtipos": ["GPERS", "GACT"]
            },
            {
                "codigo": "inversion_actividad",
                "nombre": "Inversiones Relacionadas a la Actividad Gravada",
                "subtipos": ["INM", "MEH", "ACCIONES"]
            },
            {
                "codigo": "inversion_personas",
                "nombre": "Inversiones Personales y de familiares a Cargo",
                "subtipos": ["INM"]
            }
        ]
    }, {
        "codigo": "3",
        "nombre": "Boleta de Venta",
        "egresos": [
            {
                "codigo": "gasto",
                "nombre": "Gasto",
                "subtipos": ["GPERS", "GACT"]
            },
            {
                "codigo": "inversion_actividad",
                "nombre": "Inversiones Relacionadas a la Actividad Gravada",
                "subtipos": ["MEH", "INM", "EDU", "INVLF"]
            },
            {
                "codigo": "inversion_personas",
                "nombre": "Inversiones Personales y de familiares a Cargo",
                "subtipos": []
            }
        ]
    },
        {
            "codigo": "4",
            "nombre": "Nota de Crédito",
            "egresos": [
                {
                    "codigo": "gasto",
                    "nombre": "Gasto",
                    "subtipos": ["GPERS", "GACT", "DONAC", "PREST", "CUOTA", "RECPOS"]
                },
                {
                    "codigo": "inversion_actividad",
                    "nombre": "Inversiones Relacionadas a la Actividad Gravada",
                    "subtipos": ["MEH", "INM", "EDU", "INVLF", "ACCIONES"]
                },
                {
                    "codigo": "inversion_personas",
                    "nombre": "Inversiones Personales y de familiares a Cargo",
                    "subtipos": ["INM", "EDU", "COLOC", "SALUD"]
                }
            ]
        },
        {
            "codigo": "5",
            "nombre": "Liquidación de Salarios",
            "egresos": [
                {
                    "codigo": "gasto",
                    "nombre": "Gasto",
                    "subtipos": ["DESCJBPN"]
                },
                {
                    "codigo": "inversion_actividad",
                    "nombre": "Inversiones Relacionadas a la Actividad Gravada",
                    "subtipos": []
                },
                {
                    "codigo": "inversion_personas",
                    "nombre": "Inversiones Personales y de familiares a Cargo",
                    "subtipos": []
                }
            ]
        },
        {
            "codigo": "6",
            "nombre": "Extracto de Cuenta IPS",
            "egresos": [
                {
                    "codigo": "gasto",
                    "nombre": "Gasto",
                    "subtipos": ["REMDEP", "APRTSS"]
                },
                {
                    "codigo": "inversion_actividad",
                    "nombre": "Inversiones Relacionadas a la Actividad Gravada",
                    "subtipos": []
                },
                {
                    "codigo": "inversion_personas",
                    "nombre": "Inversiones Personales y de familiares a Cargo",
                    "subtipos": []
                }
            ]
        },
        {
            "codigo": "7",
            "nombre": "Extracto de Tarjeta de Crédito/Tarjeta de Débito",
            "egresos": [
                {
                    "codigo": "gasto",
                    "nombre": "Gasto",
                    "subtipos": ["GPERSEXT", "GACTEXT"]
                },
                {
                    "codigo": "inversion_actividad",
                    "nombre": "Inversiones Relacionadas a la Actividad Gravada",
                    "subtipos": ["EDU", "INVLFEXT"]
                },
                {
                    "codigo": "inversion_personas",
                    "nombre": "Inversiones Personales y de familiares a Cargo",
                    "subtipos": ["EDU", "SALUD"]
                }
            ]
        },
        {
            "codigo": "9",
            "nombre": "Transferencias o Giros Bancarios / Boleta de Depósito",
            "egresos": [
                {
                    "codigo": "gasto",
                    "nombre": "Gasto",
                    "subtipos": ["GPERSEXT", "GACTEXT", "GPERSSINCV"]
                },
                {
                    "codigo": "inversion_actividad",
                    "nombre": "Inversiones Relacionadas a la Actividad Gravada",
                    "subtipos": ["EDU", "INVLFEXT"]
                },
                {
                    "codigo": "inversion_personas",
                    "nombre": "Inversiones Personales y de familiares a Cargo",
                    "subtipos": ["EDU", "SALUD"]
                }
            ]
        },
        {
            "codigo": "10",
            "nombre": "Comprobante del Exterior Legalizado",
            "egresos": [
                {
                    "codigo": "gasto",
                    "nombre": "Gasto",
                    "subtipos": ["GPERSEXT", "GACTEXT"]
                },
                {
                    "codigo": "inversion_actividad",
                    "nombre": "Inversiones Relacionadas a la Actividad Gravada",
                    "subtipos": ["EDU", "INVLFEXT"]
                },
                {
                    "codigo": "inversion_personas",
                    "nombre": "Inversiones Personales y de familiares a Cargo",
                    "subtipos": ["EDU", "SALUD"]
                }
            ]
        },
        {
            "codigo": "11",
            "nombre": "Comprobante de Ingreso Entidad Pública, Religiosas o de Beneficio Público",
            "egresos": [
                {
                    "codigo": "gasto",
                    "nombre": "Gasto",
                    "subtipos": ["DONAC", "GPERS", "GACT"]
                },
                {
                    "codigo": "inversion_actividad",
                    "nombre": "Inversiones Relacionadas a la Actividad Gravada",
                    "subtipos": ["EDU"]
                },
                {
                    "codigo": "inversion_personas",
                    "nombre": "Inversiones Personales y de familiares a Cargo",
                    "subtipos": ["EDU", "SALUD"]
                }
            ]
        },
        {
            "codigo": "12",
            "nombre": "Ticket (Máquina Registradora)",
            "egresos": [
                {
                    "codigo": "gasto",
                    "nombre": "Gasto",
                    "subtipos": ["GPERS", "GACT"]
                }
            ]
        },
        {
            "codigo": "13",
            "nombre": "Despacho de Importación",
            "egresos": [
                {
                    "codigo": "gasto",
                    "nombre": "Gasto",
                    "subtipos": ["IMPBIENES"]
                },
                {
                    "codigo": "inversion_actividad",
                    "nombre": "Inversiones Relacionadas a la Actividad Gravada",
                    "subtipos": ["MEH"]
                }
            ]
        },
        {
            "codigo": "14",
            "nombre": "Otros comprobantes de venta que respaldan los egresos (pasaje aéreos, entradas a espectáculos públicos, boletos de transporte público) o cuando no exista la obligación de emitir comprobantes de venta",
            "egresos": [
                {
                    "codigo": "gasto",
                    "nombre": "Gasto",
                    "subtipos": ["GPERS", "GACT"]
                },
                {
                    "codigo": "inversion_actividad",
                    "nombre": "Inversiones Relacionadas a la Actividad Gravada",
                    "subtipos": ["CAPITAL"]
                },
                {
                    "codigo": "inversion_personas",
                    "nombre": "Inversiones Personales y de familiares a Cargo",
                    "subtipos": ["COLOC"]
                }
            ]
        }
    ],
    "SOCIEDAD_SIMPLE": [
        {
            "codigo": "1",
            "nombre": "Factura",
            "egresos": [
                {
                    "codigo": "gasto",
                    "nombre": "Gasto",
                    "subtipos": ["REMINDEP", "DONAC", "GSTADM", "CMPOF", "GSTACT"]
                },
                {
                    "codigo": "inversion",
                    "nombre": "Inversiones Relacionadas a la Actividad Gravada",
                    "subtipos": ["MEH", "INM", "EDU", "INVLF", "ACCIONES"]
                }
            ]
        },
        {
            "codigo": "2",
            "nombre": "Autofactura",
            "egresos": [
                {
                    "codigo": "gasto",
                    "nombre": "Gasto",
                    "subtipos": ["GSTACT"]
                },
                {
                    "codigo": "inversion",
                    "nombre": "Inversiones Relacionadas a la Actividad Gravada",
                    "subtipos": ["INM", "MEH", "ACCIONES"]
                }
            ]
        },
        {
            "codigo": "3",
            "nombre": "Boleta de Venta",
            "egresos": [
                {
                    "codigo": "gasto",
                    "nombre": "Gasto",
                    "subtipos": ["CMPOF", "GSTACT"]
                },
                {
                    "codigo": "inversion",
                    "nombre": "Inversiones Relacionadas a la Actividad Gravada",
                    "subtipos": ["INM", "MEH"]
                }
            ]
        },
        {
            "codigo": "4",
            "nombre": "Nota de Crédito",
            "egresos": [
                {
                    "codigo": "gasto",
                    "nombre": "Gasto",
                    "subtipos": ["REMINDEP", "DONAC", "GSTADM", "CMPOF", "GSTACT"]
                },
                {
                    "codigo": "inversion",
                    "nombre": "Inversiones Relacionadas a la Actividad Gravada",
                    "subtipos": ["MEH", "INM", "EDU", "INVLF", "ACCIONES"]
                }
            ]
        },
        {
            "codigo": "6",
            "nombre": "Extracto de Cuenta IPS",
            "egresos": [
                {
                    "codigo": "gasto",
                    "nombre": "Gasto",
                    "subtipos": ["REMDEP", "APRTSS"]
                },
                {
                    "codigo": "inversion",
                    "nombre": "Inversiones Relacionadas a la Actividad Gravada",
                    "subtipos": []
                }
            ]
        },
        {
            "codigo": "7",
            "nombre": "Extracto de Tarjeta de Crédito/Tarjeta de Débito",
            "egresos": [
                {
                    "codigo": "gasto",
                    "nombre": "Gasto",
                    "subtipos": ["GSTACTEXT"]
                },
                {
                    "codigo": "inversion",
                    "nombre": "Inversiones Relacionadas a la Actividad Gravada",
                    "subtipos": ["EDU"]
                }
            ]
        },
        {
            "codigo": "10",
            "nombre": "Comprobante del Exterior Legalizado ",
            "egresos": [
                {
                    "codigo": "gasto",
                    "nombre": "Gasto",
                    "subtipos": ["GSTACTEXT"]
                },
                {
                    "codigo": "inversion",
                    "nombre": "Inversiones Relacionadas a la Actividad Gravada",
                    "subtipos": ["INVLFEXT", "EDU"]
                }
            ]
        },
        {
            "codigo": "9",
            "nombre": "Transferencias o Giros Bancarios / Boleta de Depósito",
            "egresos": [
                {
                    "codigo": "gasto",
                    "nombre": "Gasto",
                    "subtipos": ["GSTACTEXT"]
                },
                {
                    "codigo": "inversion",
                    "nombre": "Inversiones Relacionadas a la Actividad Gravada",
                    "subtipos": ["EDU"]
                }
            ]
        },
        {
            "codigo": "11",
            "nombre": "Comprobante de Ingreso Entidad Pública, Religiosas o de Beneficio Público",
            "egresos": [
                {
                    "codigo": "gasto",
                    "nombre": "Gasto",
                    "subtipos": ["DONAC", "GSTACT"]
                },
                {
                    "codigo": "inversion",
                    "nombre": "Inversiones Relacionadas a la Actividad Gravada",
                    "subtipos": ["EDU"]
                }
            ]
        },
        {
            "codigo": "12",
            "nombre": "Ticket (Máquina Registradora)",
            "egresos": [
                {
                    "codigo": "gasto",
                    "nombre": "Gasto",
                    "subtipos": ["CMPOF", "GSTACT"]
                }
            ]
        },
        {
            "codigo": "13",
            "nombre": "Despacho de Importación",
            "egresos": [
                {
                    "codigo": "inversion",
                    "nombre": "Inversiones Relacionadas a la Actividad Gravada",
                    "subtipos": ["MEH"]
                }
            ]
        },
        {
            "codigo": "14",
            "nombre": "Otros comprobantes de venta que respaldan los egresos (pasaje aéreos, entradas a espectáculos públicos, boletos de transporte público) o cuando no exista la obligación de emitir comprobantes de venta",
            "egresos": [
                {
                    "codigo": "gasto",
                    "nombre": "Gasto",
                    "subtipos": ["GSTACT"]
                },
                {
                    "codigo": "inversion",
                    "nombre": "Inversiones Relacionadas a la Actividad Gravada",
                    "subtipos": ["INVLF", "CAPITAL"]
                }
            ]
        }
    ]
};

export const EGRESO_TYPES = {
    "GPERS": "Gastos personales y de familiares a cargo realizados en el país",
    "GPERSSINCV": "Gastos personales y de familiares a cargo realizados en el país, cuando no exista obligación de contar con comprobantes de venta",
    "GACT": "Gastos relacionados a la actividad gravada realizados en el país",
    "DONAC": "Donaciones",
    "PREST": "Amortización o cancelación de préstamos obtenidos antes de ser contribuyente del IRP, así como sus intereses, comisiones y otros recargos",
    "CUOTA": "Cuotas de capital de las financiaciones, así como los intereses, las comisiones y otros recargos pagados por la adquisición de bienes o servicios",
    "MEH": "Muebles, Equipos y Herramientas",
    "INM": "Adquisición de inmuebles, construcción o mejoras de inmuebles",
    "EDU": "Educación y/o Capacitación",
    "COLOC": "Colocaciones de dinero",
    "DESCJBPN": "Descuentos legales por Aporte al Régimen de Jubilaciones y Pensiones en carácter de trabajador dependiente",
    "REMDEP": "Salarios y otras remuneraciones pagados a trabajadores dependientes",
    "APRTSS": "Aportes al régimen de seguridad social en carácter de empleador",
    "GPERSEXT": "Gastos personales y de familiares a cargo realizados en el exterior",
    "GACTEXT": "Gastos relacionados a la actividad gravada realizados en el exterior",
    "GSTADM": "Intereses, comisiones y demás gastos administrativos",
    "RECPOS": "Intereses, comisiones y otros recargos pagados por los préstamos obtenidos, con posterioridad a ser contribuyentes del IRP",
    "CMPOF": "Compra de útiles de oficina, gastos de limpieza y mantenimiento",
    "GSTACT": "Otros gastos realizados relacionados a la actividad gravada",
    "REMINDEP": "Honorarios y otras remuneraciones pagados al personal independiente",
    "GSTACTEXT": "Gastos realizados en el exterior relacionados a la actividad gravada",
    "OG": "Otros gastos realizados en el ejercicio",
    "INVLF": "Inversión en licencias, franquicias y otros similares",
    "INVLFEXT": "Inversión en licencias, franquicias y otros similares, adquiridos del exterior",
    "IMPBIENES": "Importación ocasional de bienes",
    "ACCIONES": "Compra de acciones o cuotas partes de sociedades constituídas en el país",
    "CAPITAL": "Aporte de capital realizado en sociedades constituídas en el país",
    "SALUD": "Salud"
} as { [k: string]: string };
