import {Tag, theme} from 'antd';
import {AS_OPTIONS, TAGS_LOOKUP} from './Model';
import React, {useCallback, useEffect, useState} from 'react';
import {PlusOutlined} from '@ant-design/icons';

export function MiscoTag(props: { tags?: string[] }) {
    return (props.tags ?? []).map(t => <Tag key={t}>{TAGS_LOOKUP[t] || t}</Tag>)
}

export function TagBar(props: {
    onChanged: (tags: string[]) => void,
}) {

    const {token} = theme.useToken();
    const tagPlusStyle = {
        background: token.colorBgContainer,
        borderStyle: 'dashed',
    };
    const [tags, setTags] = useState<string[]>([]);

    const toggleTag = useCallback((e: React.MouseEvent<HTMLSpanElement>) => {
        const tag = e.currentTarget.id;

        setTags(pre => {
            const wasSelected = pre.includes(tag);
            const wasNegated = pre.includes(`!${tag}`);
            if (wasSelected) return pre.map(pt => pt === tag ? `!${tag}` : pt);
            if (wasNegated) return pre.filter(pt => pt !== `!${tag}`);
            return [...pre, tag];
        });
    }, []);

    useEffect(() => props.onChanged(tags), [tags]);

    return <>
        {AS_OPTIONS.map(o => {
            const selected = tags.includes(o.value);
            const negated = tags.includes(`!${o.value}`);
            const noUsed = !selected && !negated;
            const style = noUsed ? tagPlusStyle : {};
            const color = selected ? 'green' : negated ? 'red' : undefined;
            return <Tag key={o.value}
                        id={o.value}
                        color={color}
                        style={style} onClick={toggleTag}>
                {noUsed && <PlusOutlined/>}
                {negated && '!'}
                {o.label}
            </Tag>
        })}
    </>
}
