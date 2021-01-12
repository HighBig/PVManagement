import React from 'react';
import { ModalForm } from '@ant-design/pro-form';

const CreateForm = (props) => {
  const { onFinish, trigger, formNode } = props;
  return (
    <ModalForm
      title="月度结算"
      width={628}
      trigger={trigger}
      modalProps={{
        destroyOnClose: true,
        okText: '提交',
        maskClosable: false,
      }}
      onFinish={async (values) => {
        onFinish(values)
        return true;
      }}
    >
      {formNode}
    </ModalForm>
  );
};

export default CreateForm;