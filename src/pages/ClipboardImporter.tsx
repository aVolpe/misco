import {useEffect, useState} from "react";
import {Button, Col, Flex, Row, Select, Tabs} from 'antd';
import {merge, parseClipboard, ParseResult} from '../import_parsers/ClipboardParser';
import {JsonTable} from '../components/JsonTable';
import {AS_OPTIONS} from '../tags/Model';
import {formatMoney} from "../utils/formatters";

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

    function append() {
        const newData = parseClipboard(raw);
        const merged = merge(parsed, newData);
        setParsed(merged);
        if (merged) props.onNewParsed(merged, tags);
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
            <Flex gap="small" wrap>
            <Button onClick={doParse} type="primary">Parsear</Button>
            <Button onClick={append}>Agregar</Button>
            <Button danger onClick={() => {
                setParsed(undefined);
                setRaw('');
            }}>Limpiar</Button>
            </Flex>
        </Col>
        {parsed && <Col span={24}>
          <h2>Vista previa, total {parsed.length}.</h2>
          <Tabs defaultActiveKey="table" items={[{
              key: 'table',
              label: 'Table',
              children: <JsonTable 
                  rowKey="identifier" 
                  data={parsed || []} 
                  columns={{
                      "total": {
                        title: 'total',
                        dataIndex: 'total',
                        sorter: (a, b) => a.total - b.total,
                        align: 'right',
                        render: a => formatMoney(a)
                      }
                  }}
          />
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
