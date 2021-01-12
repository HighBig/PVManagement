import React from 'react';
import { Modal } from 'antd';

const ModalForm = (props) => {
  const { modalVisible, onCancel, title } = props;
  return (
    <Modal
      destroyOnClose
      maskClosable={false}
      title={title}
      visible={modalVisible}
      onCancel={() => onCancel()}
      footer={null}
    >
      {props.children}
    </Modal>
  );
};

export default ModalForm;