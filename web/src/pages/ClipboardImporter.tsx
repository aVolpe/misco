import React, {useState} from "react";
import {Button, Col, Row} from 'antd';
import {parseClipboard, ParseResult} from '../import_parsers/ClipboardParser';

export function ClipboardImporter(props: {
    onNewParsed: (parsed: Array<Partial<ParseResult>>) => void
}) {

    const [parsed, setParsed] = useState<Array<Partial<ParseResult>>>()
    const [raw, setRaw] = useState<string>('')

    function doParse() {

        const t = parseClipboard(raw);
        setParsed(t);
        if (t) props.onNewParsed(t);
    }

    return <Row gutter={[20, 20]}>
        <Col span={24}>
            <textarea style={{width: '100%'}} value={raw} onChange={e => setRaw(e.target.value)}/>
        </Col>
        <Col span={24}>
            <Button onClick={doParse}>Parsear</Button>
            <Button onClick={() => setParsed(undefined)}>Limpiar</Button>
        </Col>
        <Col span={24}>
            <pre>
                {JSON.stringify(parsed, null, 2)}
            </pre>
        </Col>
    </Row>
}
