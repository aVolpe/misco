import {Button, Col, Row} from 'antd';
import React, {useEffect, useMemo, useState} from 'react';
import {Expense} from '../set/Model';
import {countBy} from 'lodash';

/**
 * This component will load all the duplicates and show one by one
 */
export function DuplicateHelper(props: {
    expenses: Expense[],
    onRemove: (r: number) => void;
}) {

    const [current, setCurrent] = useState<Expense[]>([])
    const duplicates = useMemo(() => {
        const byIdentifier = countBy(props.expenses, 'voucher')
        return Object.keys(byIdentifier).filter(k => {
            return byIdentifier[k] > 1
        })
    }, [props.expenses])

    useEffect(() => {
        if (duplicates.length === 0) {
            setCurrent([]);
            return;
        }
        const curr = duplicates[0];
        setCurrent(props.expenses.filter(e => e.voucher === curr));
    }, [props.expenses, duplicates]);


    console.log({current, duplicates});
    if (!current || current.length === 0) {
        return <>No se encontraron duplicados.</>
    }

    return <Row gutter={[20, 20]}>
        <Col span={24}>
            Duplicado actual {current[0].identifier}, cantidad total {Object.keys(duplicates).length}
        </Col>
        <Col>
            <Row>
                {current.map(c => <Col key={c.id}>
                    <pre>{JSON.stringify(c, null, 2)}</pre>
                    <Button type="danger" onClick={() => props.onRemove(c.id)}>Eliminar este registro</Button>
                </Col>)}
            </Row>
        </Col>
    </Row>

}
