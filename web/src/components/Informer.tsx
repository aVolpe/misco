import React from 'react';
import {Descriptions} from 'antd';
import {User} from "../set/Model";

export function Informer(props: { informer: User }) {

    return <Descriptions size="small" column={3}>
        <Descriptions.Item label="Nombre">{props.informer.name}</Descriptions.Item>
        <Descriptions.Item label="ID">{props.informer.identifier}</Descriptions.Item>
    </Descriptions>
}
