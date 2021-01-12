import React from 'react';
import { Modal } from 'antd';
import ProForm from '@ant-design/pro-form';

const UpdateForm = (props) => {
  const { onCancel, onFinish, formValues, visible, formNode } = props;
  return (
    <Modal
      title="修改电量"
      visible={visible}
      destroyOnClose
      okText='提交'
      maskClosable={false}
      onCancel={() => onCancel()}
      footer={null}
    >
      <ProForm
        initialValues={formValues}
        onFinish={async (values) => onFinish(values)}
      >
        {formNode}
      </ProForm>
    </Modal>
  );
};

export default UpdateForm;