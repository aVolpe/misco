import React, {useEffect, useState} from "react";
import {Button, Col, Row, Select, Tabs} from 'antd';
import {parseClipboard, ParseResult} from '../import_parsers/ClipboardParser';
import {JsonTable} from '../components/JsonTable';
import {AS_OPTIONS} from '../tags/Model';

export function ClipboardImporter(props: {
    onNewParsed: (parsed: Array<Partial<ParseResult>>, tags: string[]) => void
}) {

    const [parsed, setParsed] = useState<Array<Partial<ParseResult>>>()
    const [raw, setRaw] = useState<string>('')
    const [tags, setTags] = useState<string[]>([]);

    function doParse() {

        const t = parseClipboard(raw);
        setParsed(t);
        if (t) props.onNewParsed(t, tags);
    }

    useEffect(() => {
        if (parsed)
            props.onNewParsed(parsed, tags);
    }, [tags]);

    return <Row gutter={[20, 20]}>
        <Col span={24}>
            <textarea style={{width: '100%'}} value={raw} onChange={e => setRaw(e.target.value)}/>
        </Col>
        <Col span={24}>
            <Button onClick={doParse}>Parsear</Button>
            <Button onClick={() => {
                setParsed(undefined);
                setRaw('');
            }}>Limpiar</Button>
        </Col>
        {parsed && <Col span={24}>
          <h2>Vista previa</h2>
          <Tabs defaultActiveKey="table" items={[{
              key: 'table',
              label: 'Table',
              children: <JsonTable rowKey="identifier" data={parsed || []}/>
          }, {
              key: 'json',
              label: 'Json',
              children: <div style={{maxHeight: 500, overflow: 'scroll'}}>
                  <pre> {JSON.stringify(parsed, null, 2)} </pre>
              </div>
          }]}>
          </Tabs>
        </Col>}
        {parsed && <Col span={24}>
          <h2>Tags a agregar (opcional)</h2>
          <Select
            mode="multiple"
            allowClear
            style={{width: '100%'}}
            placeholder="Please select"
            onChange={setTags}
            options={AS_OPTIONS}
          />
          <hr/>
        </Col>}
        {parsed && <Col span={24}>
          <h2>Resumen</h2>
          <span>Se importaran {parsed.length} registros con los tags '{tags.join(",")}'</span>
        </Col>}
    </Row>
}
