import {Table} from "antd";
import * as React from "react";
import {ColumnProps} from 'antd/es/table/Column';
import {useState} from 'react';

export function JsonTable({data, title, columns, rowKey}: {
    rowKey: string,
    data: object[],
    title?: string,
    columns?: {
        [k: string]: ColumnProps<any>
    }
}) {

    if (!Array.isArray(data)) {
        return <div>Los datos no son una lista</div>
    }

    const hasData = data.length > 0;

    const finalColumns: ColumnProps<any>[] = hasData
        ? Object.keys(data[0])
            .map(key => {
                if (columns && columns[key]) return columns[key];
                return {
                    title: key,
                    dataIndex: key,
                    sorter: (a, b) => `${a[key]}`.localeCompare(`${b[key]}`),
                }
            })
        : [];

    return <>
        <Table dataSource={data}
               rowKey={rowKey}
               caption={title}
               showHeader={hasData}
               size="small"
               footer={undefined}
               locale={{
                   // emptyText: "Sin resultados"
               }}
               scroll={hasData ? {x: '80vw'} : undefined}
               columns={finalColumns}/>
    </>
}
