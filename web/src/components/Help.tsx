import React from 'react';
import {Button, Row} from 'antd';


export function Help(props: { onNewInvoice: () => void }) {
    return <div>
        <Row>
            Puedes apretar
            <Button title="Agregar" onClick={props.onNewInvoice}>
                este boton
            </Button>
            para agregar una nueva factura
        </Row>
        <Row>
            Las facturas se autocompletan con info de <a href="https://ruc.volpe.com.py">https://ruc.volpe.com.py</a>
        </Row>
    </div>
}
