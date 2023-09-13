export const IncomeOriginDocumentType = {
    ruc: "RUC",
    document: "CÉDULA DE IDENTIDAD",
    other: "OTROS"
}

export const IncomeType = {
    salary: "LIQUIDACIÓN DE SALARIO",
    summary: "EXTRACTO DE CUENTA (Cuando no exista la obligación legal de expedir comprobante de venta)",
    other: "OTROS DOCUMENTOS QUE RESPALDAN LOS INGRESOS (Cuando no exista la obligación legal de expedir comprobante de venta)"
}


export const ExpenseIdentifierType = {
    ruc: "RUC",
    document: 'CÉDULA DE IDENTIDAD',
    passport: "PASAPORTE",
    migrationDocument: 'CARNÉ DE MIGRACIÓN',
    employerNumber: 'NÚMERO DE EMPLEADOR',
    externalProviderIdentifier: 'IDENTIFICACIÓN TRIBUTARIA (PROVEEDORES DEL EXTERIOR)'
}

export const ExpenseDocumentType = {
    invoice: 'FACTURA',
    voucher: 'BOLETA DE VENTA',
    simpleVoucher: 'BOLETA RESIMPLE',
    selfInvoice: 'AUTOFACTURA',
    publicEventTicket: 'ENTRADA A ESPECTÁCULOS PÚBLICOS',
    publicTransportTicket: 'BOLETO DE TRANSPORTE PÚBLICO',
    publicIncomeTicket: 'COMPROBANTE DE INGRESO O RECIBO DE ENTIDAD PÚBLICA, RELIGIOSAS O DE BENEFICIO PÚBLICO',
    airTicket: 'TICKET DE TRANSPORTE AÉREO',
    cashierMachineTicket: 'TICKET DE MÁQUINA REGISTRADORA',
    debitNote: 'NOTA DE DÉBITO RECIBIDA',
    salary: 'LIQUIDACIÓN DE SALARIO',
    ips: 'EXTRACTO DE CUENTA IPS',
    cardSummary: 'EXTRACTO DE TARJETA DE CRÉDITO/TARJETA DE DÉBITO',
    transfer: 'TRANSFERENCIAS O GIROS BANCARIOS/ BOLETA DE DEPÓSITO',
    externalTicket: 'COMPROBANTE DEL EXTERIOR LEGALIZADO',
    importTicket: 'DESPACHO DE IMPORTACIÓN',
    other: "OTROS COMPROBANTES DE VENTA QUE RESPALDEN EGRESOS (Cuando no exista obligación legal de expedir comprobantes de ventas)"
}

export const PaymentType = {
    cash: "CONTADO",
    credit: "CRÉDITO",
    na: "NO APLICA"
}
