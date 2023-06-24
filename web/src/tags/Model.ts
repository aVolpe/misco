import {SelectProps} from 'antd';

export const ALL_TAGS: Array<MiscoTag> = [{
    id: 'ELECTRONIC_INVOICE',
    label: 'Factura electronica'
}];

export interface MiscoTag {
    id: string;
    label: string;
}

export const AS_OPTIONS: SelectProps['options'] = ALL_TAGS.map(t => ({
    label: t.label,
    value: t.id
}));
