import React from 'react';
import {AlertTwoTone, WarningTwoTone} from '@ant-design/icons'
import {Alert, Col, Row} from 'antd';


export function Help(props: {
    onNewInvoice: () => void;
    type: 'income' | 'invoice'
}) {
    return <Row gutter={[8, 8]}>
        <Col span={24}>
            <Alert
                message="Tip"
                description={<div onClick={props.onNewInvoice}>
                    Puedes presionar aquí para agregar
                    <br/>
                    {props.type === 'income' ? 'un nuevo ingreso' : 'una nueva factura'} o presiona <b> Control+i</b>
                </div>}
                type="info"
                showIcon
                icon={<AlertTwoTone/>}
            />
        </Col>
        <Col span={24}>
            <Alert
                message="Atención"
                description="Este sistema no guarda ningúna informacion, asegurate de exportar tus datos!"
                type="warning"
                showIcon
                icon={<WarningTwoTone twoToneColor="#ebd027"/>}
            />
        </Col>
        <Col span={24}>
            <Alert message={<div>Las facturas se autocompletan con información de <a
                href="https://ruc.volpe.com.py">ruc.volpe.com.py</a></div>} type="info"/>
        </Col>
    </Row>
}
