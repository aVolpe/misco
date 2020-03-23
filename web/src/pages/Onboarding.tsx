import React from 'react';
import {Alert, Button, Col, PageHeader, Row, Timeline, Upload} from 'antd';
import {UploadOutlined} from '@ant-design/icons';
import {RcFile} from 'antd/es/upload';
import {SETImporter} from '../set/SETImporter';

function doProcess(file: RcFile) {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        reader.onload = () => {
            const data = (JSON.parse(reader.result as string));
            new SETImporter().doImport(data);
        };
    });
}

export function Onboarding() {
    return <PageHeader ghost={false}
                       style={{border: '1px solid rgb(235, 237, 240)'}}
                       title="MISCO"
                       subTitle="Sistema suplementario para Aranduka"
                       extra={[]}>
        <Row gutter={[16, 16]} style={{margin: 16}}>
            <Col span={24}>
                <Alert message=" Para usar el sistema debes importar datos del Aranduka " type="warning"/>
            </Col>
            <Col>

                <Timeline>
                    <Timeline.Item>
                        Descarga e instala Aranduka
                    </Timeline.Item>
                    <Timeline.Item>
                        Inicia sesión y completa tus tados
                    </Timeline.Item>
                    <Timeline.Item>
                        Puedes cargar unas egresos e ingresos
                    </Timeline.Item>
                    <Timeline.Item>
                        Exporta tus datos
                    </Timeline.Item>
                    <Timeline.Item>
                        Descomprime el archivo, y luego subí el archivo que termina en <b>detalle.json</b>.
                        <br/>
                        <br/>
                        <Upload beforeUpload={file => {
                            doProcess(file);
                            return false;
                        }}>
                            <Button>
                                <UploadOutlined/> Click para subir archivo
                            </Button>
                        </Upload>
                        <br/>
                        <small>Tambien puedes utilizar el archivo que genera este sistema.</small>
                    </Timeline.Item>
                </Timeline>
            </Col>

        </Row>


        ,


    </PageHeader>
}
