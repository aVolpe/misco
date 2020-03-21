import React from 'react';
import {Descriptions} from 'antd';
import {Informante} from '../set/ArandukaModel';

export function Informer(props: { informer: Informante }) {

    return <Descriptions size="small" column={3}>
        <Descriptions.Item label="Nombre">{props.informer.nombre}</Descriptions.Item>
        <Descriptions.Item label="RUC">{props.informer.ruc}-{props.informer.dv}</Descriptions.Item>
    </Descriptions>
}
