import {Button, Col, Row} from 'antd';
import React, {useMemo, useState} from 'react';
import {Expense} from '../set/Model';
import {countBy} from 'lodash';

/**
 * This component will load all the duplicates and show one by one
 */
export function DuplicateHelper(props: {
    expenses: Expense[],
    onRemove: (r: number) => void;
}) {

    const [currentIdx, setCurrentIdx] = useState<number>(0)

    const duplicates = useMemo(() => {
        const byIdentifier = countBy(props.expenses, 'voucher')
        return Object.keys(byIdentifier).filter(k => {
            return byIdentifier[k] > 1
        })
    }, [props.expenses])


    const idx = currentIdx > duplicates.length ? 0 : currentIdx;
    const currentIdentifier = duplicates[idx];
    const current = props.expenses.filter(e => e.voucher === currentIdentifier)
    const total = Object.keys(duplicates).length;

    if (!current || current.length === 0) {
        return <>No se encontraron duplicados. ({currentIdx})</>
    }

    return <Row gutter={[20, 20]}>
        <Col span={24}>
            Duplicado actual {currentIdentifier} ({currentIdx + 1}), cantidad total {total}
        </Col>
        <Col span={24}>
            <Button disabled={idx < 1} onClick={() => setCurrentIdx(d => idx - 1)}>Anterior</Button>
            <Button disabled={idx + 1 === total} onClick={() => setCurrentIdx(d => idx + 1)}>Siguiente</Button>
        </Col>
        <Col>
            <Row>
                {current.map(c => <Col key={c.id}>
                    <pre>{JSON.stringify(c, null, 2)}</pre>
                    <Button danger onClick={() => props.onRemove(c.id)}>Eliminar este registro</Button>
                </Col>)}
            </Row>
        </Col>
    </Row>

}
