import React, {useState} from 'react';
import {Alert, Button, Col, Form, Input, message, Modal, PageHeader, Radio, Row, Timeline, Upload} from 'antd';
import {UploadOutlined} from '@ant-design/icons';
import {RcFile} from 'antd/es/upload';
import {SETImporter} from '../set/SETImporter';
import {User} from "../set/Model";
import {writeStorage} from "@rehooks/local-storage";
import DigitGenerator from "../set/DigitGenerator";

function doProcess(file: RcFile) {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        reader.onload = () => {
            const data = (JSON.parse(reader.result as string));
            new SETImporter().doImport(data);
            resolve();
        };
    });
}

async function fromScratch(user: User) {
    // TODO move to a logic file
    writeStorage('informante', user);
    writeStorage('ingresos', []);
    writeStorage('egresos', []);
}

export function Onboarding() {

    const [modalVisible, setModalVisible] = useState<boolean>(false);


    return <PageHeader ghost={false}
                       style={{border: '1px solid rgb(235, 237, 240)'}}
                       title="MISCO"
                       subTitle="Sistema suplementario para Aranduka"
                       extra={[]}>
        <Row gutter={[16, 16]} style={{margin: 16}}>
            <Col span={24}>
                <Alert message=" Para usar el sistema debes importar datos del Aranduka " type="warning"/>
            </Col>
            <Col span={24}>

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
                        <small>También puedes utilizar el archivo que genera este sistema.</small>
                    </Timeline.Item>
                </Timeline>
            </Col>
            <Col span={24}>
                <Button onClick={() => setModalVisible(true)} type="primary">
                    También puedes empezar desde 0 apretando este botón
                </Button>
            </Col>

        </Row>
        <FromScratchModal visible={modalVisible}
                          onCancel={() => setModalVisible(false)}
                          onAccept={fromScratch}/>


    </PageHeader>
}

function addVerifier(document: string): string {
    if (document.indexOf('-') >= 0) return document;
    return `${document}-${new DigitGenerator().getDigitoVerificadorBase11(document)}`
}

function FromScratchModal(props: {
    visible: boolean;
    onCancel: () => void;
    onAccept: (u: User) => Promise<void>;
}) {
    const [form] = Form.useForm();
    const [working, setWorking] = useState<boolean>(false);
    const layout = {
        labelCol: {span: 8},
        wrapperCol: {span: 16},
    };

    return <Modal visible={props.visible}
                  title="Empezar desde 0"
                  okText="Aceptar"
                  cancelText="Cancelar"
                  onCancel={props.onCancel}
                  onOk={() => {
                      message.loading({key: "scratch", message: "Guardando"});
                      setWorking(true);
                      form.validateFields()
                          .then(values => {
                              return props.onAccept({
                                  identifier: addVerifier(values.identifier),
                                  name: `${values.name}`.toUpperCase(),
                                  type: values.type,
                                  version: 2
                              });
                          })
                          .then(() => {
                              form.resetFields();
                              message.success({key: "scratch", message: "Bienvenido"})
                          })
                          .catch(info => {
                              console.warn(info);
                              message.warning({key: "scratch", message: "Error al validar campos"});
                          })
                          .finally(() => setWorking(false))
                      ;
                  }}
    >
        <Form form={form}
              {...layout}
              layout="horizontal"
              name="form_in_modal"
              initialValues={{type: "FISICO"}}
        >
            <Form.Item name="identifier" label="Documento"
                       rules={[{required: true, message: 'Ingrese su documento'}]}>
                <Input disabled={working}/>
            </Form.Item>
            <Form.Item name="name" label="Nombre"
                       rules={[{required: true, message: 'Ingrese su nombre'}]}>
                <Input disabled={working}/>
            </Form.Item>
            <Form.Item name="type" label="Tipo">
                <Radio.Group disabled={working} defaultValue="FISICO">
                    <Radio value="FISICO">Físico</Radio>
                    <Radio value="SOCIEDAD_SIMPLE">Sociedad simple</Radio>
                </Radio.Group>
            </Form.Item>
        </Form>
    </Modal>
}
