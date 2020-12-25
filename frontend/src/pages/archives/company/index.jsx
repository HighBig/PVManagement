import { PlusOutlined } from '@ant-design/icons';
import { Button, Divider, message, Drawer } from 'antd';
import React, { useState, useRef } from 'react';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import ProDescriptions from '@ant-design/pro-descriptions';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';
import { queryCompany, updateCompany, addCompany, removeCompany } from './service';

/**
 * 新建项目公司
 * @param fields
 */
const handleAdd = async (fields) => {
  const hide = message.loading('正在创建');

  try {
    await addCompany({ ...fields });
    hide();
    message.success('创建成功');
    return true;
  } catch (error) {
    hide();
    message.error('创建失败请重试！');
    return false;
  }
};

/**
 * 修改项目公司
 * @param fields
 */
const handleUpdate = async (fields) => {
  const hide = message.loading('正在更新');

  try {
    await updateCompany({ ...fields });
    hide();
    message.success('修改成功');
    return true;
  } catch (error) {
    hide();
    message.error('修改失败请重试！');
    return false;
  }
};

/**
 *  删除项目公司
 * @param selectedRows
 */
const handleRemove = async (selectedRows) => {
  console.log(selectedRows);
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;

  try {
    await removeCompany({
      ids: selectedRows.map((row) => row.id),
    });
    hide();
    message.success('删除成功，即将刷新');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
    return false;
  }
};

const Company = () => {
  const [createModalVisible, handleModalVisible] = useState(false);
  const [updateModalVisible, handleUpdateModalVisible] = useState(false);
  const [formValues, setFormValues] = useState({});
  const actionRef = useRef();
  const [row, setRow] = useState();
  const [selectedRowsState, setSelectedRows] = useState([]);
  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      formItemProps: {
        rules: [
          {
            required: true,
            message: '项目公司名称为必填项',
          },
        ],
      },
      render: (dom, entity) => {
        return <a onClick={() => setRow(entity)}>{dom}</a>;
      },
    },
    {
      title: '简称',
      dataIndex: 'short_name',
      search: false,
      formItemProps: {
        rules: [
          {
            required: true,
            message: '项目公司简称为必填项',
          },
        ],
      }
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <>
          <a
            onClick={() => {
              handleUpdateModalVisible(true);
              setFormValues(record);
            }}
          >
            修改
          </a>
          <Divider type="vertical" />
          <a 
            onClick={async () => {
              await handleRemove([record]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            删除
          </a>
        </>
      ),
    },
  ];
  console.log(updateModalVisible, formValues);
  return (
    <PageContainer>
      <ProTable
        headerTitle="项目公司"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 60,
        }}
        toolBarRender={() => [
          <Button type="primary" onClick={() => handleModalVisible(true)}>
            <PlusOutlined /> 新建
          </Button>,
        ]}
        request={(params, sorter, filter) => queryCompany({ ...params, sorter, filter })}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => setSelectedRows(selectedRows),
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选择{' '}
              <a
                style={{
                  fontWeight: 600,
                }}
              >
                {selectedRowsState.length}
              </a>{' '}
              项
            </div>
          }
        >
          <Button
            onClick={async () => {
              await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            批量删除
          </Button>
        </FooterToolbar>
      )}
      <CreateForm onCancel={() => handleModalVisible(false)} modalVisible={createModalVisible}>
        <ProTable
          onSubmit={async (value) => {
            const success = await handleAdd(value);

            if (success) {
              handleModalVisible(false);

              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
          rowKey="id"
          type="form"
          columns={columns}
        />
      </CreateForm>
      {formValues && Object.keys(formValues).length ? (
        <UpdateForm
          onCancel={() => {
            handleUpdateModalVisible(false);
            setFormValues({});
          }}
          modalVisible={updateModalVisible}
        >
          <ProTable
            onSubmit={async (value) => {
              const success = await handleUpdate({ ...value, id: formValues.id });

              if (success) {
                handleUpdateModalVisible(false);
                setFormValues({});

                if (actionRef.current) {
                  actionRef.current.reload();
                }
              }
            }}
            rowKey="id"
            type="form"
            form={{
              initialValues: formValues
            }}
            columns={columns}
          />
        </UpdateForm>
      ) : null}

      <Drawer
        width={600}
        visible={!!row}
        onClose={() => {
          setRow(undefined);
        }}
        closable={false}
      >
        {row?.name && (
          <ProDescriptions
            column={2}
            title={row?.name}
            request={async () => ({
              data: row || {},
            })}
            params={{
              id: row?.name,
            }}
            columns={columns}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default Company;