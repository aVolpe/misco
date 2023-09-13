import {Col, Row} from 'antd';
import './BasePage.css';

export function BasePage(props: React.PropsWithChildren<{
    title: string,
    subTitle: string,
    extra?: React.ReactElement[],
    footer?: React.ReactElement
}>) {

    return <Row className="base-page">
        <Col span={24}>
            <span className="ant-page-header-heading-title">
                {props.title}
            </span>
            <span className="ant-page-header-heading-sub-title">
                {props.subTitle}
            </span>
            <span className="ant-page-header-heading-extra">
                    {props.extra}
            </span>
        </Col>
        <Col span={24}>
            {props.children}
        </Col>
        <Col span={24}>
            {props.footer}
        </Col>
    </Row>
}
