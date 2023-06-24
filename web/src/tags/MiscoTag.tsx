import {Tag} from 'antd';

export function MiscoTag(props: { tags?: string[] }) {
    return (props.tags ?? []).map(t => <Tag>{t}</Tag>)
}
