import {Invoice, NetworkResource, NRWrapper} from '../Model';
import {Row, Select, Spin} from 'antd';
import React, {useState} from 'react';
import {Person, QueryResult} from '../RucAPI';


export function InvoiceEditor(props: {
    invoice: Invoice,

    listRucs: NetworkResource<QueryResult>


    onNewRuc: (ruc: string) => void;
}) {

    const fetching = props.listRucs.state !== 'LOADED';
    const [owner, setOwner] = useState<Person>();

    return <Row>
        {JSON.stringify(owner, null, 2)}
        <Select
            mode="multiple"
            labelInValue
            value={owner}
            placeholder="Select users"
            notFoundContent={fetching ? <Spin size="small"/> : null}
            filterOption={false}
            onSearch={props.onNewRuc}
            onChange={setOwner}
            style={{width: '100%'}}
        >
            {NRWrapper.of(props.listRucs).orElse([]).map(d => (
                <Select.Option key={d.div}>{d.div} - {d.name}</Select.Option>
            ))}
        </Select>

    </Row>
}
