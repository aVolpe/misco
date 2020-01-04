import React, {useState} from 'react';
import {Col, Row} from 'antd';
import {Invoice} from '../Model';
import {Help} from '../components/Help';
import debounce from 'lodash/debounce';
import {query} from '../RucAPI';

const debouncedFetch = debounce(query, 800);

export function InvoiceListPage() {

    const [current, setCurrent] = useState<Invoice>();


    return <Row>
        <Col span={18}>
            <Row>
                Filtros (texto y mes)
            </Row>
            <Row>
                Tabla
            </Row>
        </Col>
        <Col span={6}>
            {current
                ? <div>{JSON.stringify(current)}</div>
                : <Help/>
            }
        </Col>
    </Row>
}
