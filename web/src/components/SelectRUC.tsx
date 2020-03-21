import React, {useState} from 'react';
import {Person, QueryResult} from '../RucAPI';
import {Async} from '../Model';

export function SelectRUC(props: {
    listRucs: Async<QueryResult>
    onNewRuc: (ruc: string) => void;
}) {

    const fetching = props.listRucs.state !== 'LOADED';
    const [owner, setOwner] = useState<Person>();

    // return <Select labelInValue
    //                showSearch
    //                value={owner}
    //                placeholder="Select users"
    //                notFoundContent={fetching ? <Spin size="small"/> : null}
    //                filterOption={false}
    //                onSearch={props.onNewRuc}
    //                onChange={setOwner}
    //                style={{width: '100%'}}>
    //     {NRWrapper.of(props.listRucs).orElse([]).map(d => (
    //         <Select.Option key={d.doc}>{d.doc}-{d.div}: {d.name}</Select.Option>
    //     ))}
    // </Select>;
    return <div></div>
}
