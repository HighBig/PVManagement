import { PlusOutlined } from '@ant-design/icons';
import { Button, Divider, message, Drawer, Modal, Select } from 'antd';
import React, { useEffect, useState, useRef } from 'react';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import ProDescriptions from '@ant-design/pro-descriptions';
import ModalForm from '@/components/ModalForm';
import {
  queryCompanySelectOption,
  queryStation,
  updateStation,
  addStation,
  removeStation
} from './service';

/**
 * 新建电站
 * @param fields
 */
const handleAdd = async (fields) => {
  const hide = message.loading('正在创建');

  try {
    await addStation({ ...fields });
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
 * 修改电站
 * @param fields
 */
const handleUpdate = async (fields) => {
  const hide = message.loading('正在更新');

  try {
    await updateStation({ ...fields });
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
 *  删除电站
 * @param selectedRows
 */
const handleRemove = async (selectedRows) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;

  try {
    await removeStation({
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

const Stations = () => {
  const [createModalVisible, handleModalVisible] = useState(false);
  const [updateModalVisible, handleUpdateModalVisible] = useState(false);
  const [formValues, setFormValues] = useState({});
  const actionRef = useRef();
  const [row, setRow] = useState();
  const [selectedRowsState, setSelectedRows] = useState([]);
  const [companyEnum, setCompanyEnum] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);

  useEffect(() => {
    queryCompanySelectOption().then(result => {
      const { companies } = result;
      setCompanyOptions(companies);
      const companyEnumObj = {};
      for (let i = 0; i < companies.length; i+=1) {
        companyEnumObj[companies[i].value] = companies[i].label;
      }
      setCompanyEnum(companyEnumObj);
    });
  }, []);

  const columns = [
    {
      title: '电站名称',
      dataIndex: 'name',
      formItemProps: {
        rules: [
          {
            required: true,
            message: '电站名称为必填项',
          },
        ],
      },
      render: (dom, entity) => {
        return <a onClick={() => setRow(entity)}>{dom}</a>;
      },
    },
    {
      title: '容量(kWp)',
      dataIndex: 'capacity',
      valueType: 'digit',
      search: false,
      formItemProps: {
        rules: [
          {
            required: true,
            message: '容量为必填项',
          },
        ],
      },
    },
    {
      title: '模式',
      dataIndex: 'mode',
      formItemProps: {
        rules: [
          {
            required: true,
            message: '模式为必选项',
          },
        ],
      },
      valueEnum: {
        0: '自发自用',
        1: '全额上网',
      }
    },
    {
      title: '项目公司',
      dataIndex: 'company',
      search: false,
      formItemProps: {
        rules: [
          {
            required: true,
            message: '项目公司为必选项',
          },
        ],
      },
      valueEnum: companyEnum,
      renderFormItem: () => (
        <Select
          placeholder="请选择项目公司"
          showSearch
          allowClear
          filterOption={(input, option) =>
            option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          options={companyOptions}
        />
      ),
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
              setFormValues({
                ...record,
                mode: record.mode.toString()
              });
            }}
          >
            修改
          </a>
          <Divider type="vertical" />
          <a 
            onClick={async () => {
              Modal.confirm({
                title: '确认删除电站？',
                onOk: async () => {
                  await handleRemove([record]);
                  actionRef.current?.reloadAndRest?.();
                }
              });
            }}
          >
            删除
          </a>
        </>
      ),
    },
  ];
  return (
    <PageContainer>
      <ProTable
        headerTitle="电站"
        actionRef={actionRef}
        rowKey="id"
        toolBarRender={() => [
          <Button key="list" type="primary" onClick={() => handleModalVisible(true)}>
            <PlusOutlined /> 新建
          </Button>
        ]}
        request={(params, sorter, filter) => queryStation({ ...params, sorter, filter })}
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
              Modal.confirm({
                title: '确认删除电站？',
                onOk: async () => {
                  await handleRemove(selectedRowsState);
                  setSelectedRows([]);
                  actionRef.current?.reloadAndRest?.();
                }
              });
            }}
          >
            批量删除
          </Button>
        </FooterToolbar>
      )}
      <ModalForm
        title="新建电站"
        onCancel={() => handleModalVisible(false)}
        modalVisible={createModalVisible}
      >
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
      </ModalForm>
      {formValues && Object.keys(formValues).length ? (
        <ModalForm
          title="修改电站"
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
        </ModalForm>
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

export default Stations;