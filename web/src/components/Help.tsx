import React from 'react';
import {Row} from 'antd';


export function Help() {
    return <div>
        <Row>
            Puedes apretar este boton para agregar una nueva factura
        </Row>
        <Row>
            Las facturas se autocompletan con info de <a href="https://ruc.volpe.com.py">https://ruc.volpe.com.py</a>
        </Row>
    </div>
}
