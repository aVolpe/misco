export const ALL_TAGS: Array<MiscoTag> = [{
    id: 'ELECTRONIC_INVOICE',
    label: 'Factura electronica'
}, {
    id: 'REJECTED',
    label: "Rechazado en Marangatu"
}, {
    id: 'MANUALLY_REGISTERED',
    label: "Registrado manualmente en marangatu"
}, {
    id: 'ORIGINAL_NOT_FOUND',
    label: "No se encuentra el original"
}, {
    id: 'FIXED_PENDING_UPLOAD',
    label: "Corregido localmente"
}];

export const TAGS_LOOKUP: Record<string, string> = ALL_TAGS.reduce((acc, t) => ({
    ...acc,
    [t.id]: t.label
}), {});

export interface MiscoTag {
    id: string;
    label: string;
}

export const AS_OPTIONS: Array<{ label: string, value: string }> = ALL_TAGS.map(t => ({
    label: t.label,
    value: t.id
}));
