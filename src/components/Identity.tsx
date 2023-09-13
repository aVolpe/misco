import React from 'react';
import {Descriptions} from 'antd';
import {Identificacion} from '../set/ArandukaModel';

export function Identity(props: { identity: Identificacion }) {

    return <Descriptions size="small" column={3}>
        <Descriptions.Item label="Periodo">{props.identity.periodo}</Descriptions.Item>
    </Descriptions>
}
