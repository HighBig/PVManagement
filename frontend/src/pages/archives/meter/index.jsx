import { PlusOutlined } from '@ant-design/icons';
import { Button, Divider, message, Drawer, Modal, Select } from 'antd';
import React, { useEffect, useState, useRef } from 'react';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import ProDescriptions from '@ant-design/pro-descriptions';
import ModalForm from '@/components/ModalForm';
import {
  queryStationSelectOption,
  queryMeter,
  updateMeter,
  addMeter,
  removeMeter
} from './service';

/**
 * 新建表计
 * @param fields
 */
const handleAdd = async (fields) => {
  const hide = message.loading('正在创建');

  try {
    await addMeter({ ...fields });
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
 * 修改表计
 * @param fields
 */
const handleUpdate = async (fields) => {
  const hide = message.loading('正在更新');

  try {
    await updateMeter({ ...fields });
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
 *  删除表计
 * @param selectedRows
 */
const handleRemove = async (selectedRows) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;

  try {
    await removeMeter({
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

const Meters = () => {
  const [createModalVisible, handleModalVisible] = useState(false);
  const [updateModalVisible, handleUpdateModalVisible] = useState(false);
  const [formValues, setFormValues] = useState({});
  const actionRef = useRef();
  const [row, setRow] = useState();
  const [selectedRowsState, setSelectedRows] = useState([]);
  const [stationEnum, setStationEnum] = useState([]);
  const [stationOptions, setStationOptions] = useState([]);

  useEffect(() => {
    queryStationSelectOption().then(result => {
      const { stations } = result;
      setStationOptions(stations);
      const stationEnumObj = {};
      for (let i = 0; i < stations.length; i+=1) {
        stationEnumObj[stations[i].value] = stations[i].label;
      }
      setStationEnum(stationEnumObj);
    });
  }, []);

  const columns = [
    {
      title: '表计名称',
      dataIndex: 'name',
      search: false,
      formItemProps: {
        rules: [
          {
            required: true,
            message: '表计名称为必填项',
          },
        ],
      },
      render: (dom, entity) => {
        return <a onClick={() => setRow(entity)}>{dom}</a>;
      },
    },
    {
      title: '编号',
      dataIndex: 'number',
      search: false,
    },
    {
      title: '电站',
      dataIndex: 'station',
      search: false,
      formItemProps: {
        rules: [
          {
            required: true,
            message: '电站为必选项',
          },
        ],
      },
      valueEnum: stationEnum,
      renderFormItem: () => (
        <Select
          placeholder="请选择电站"
          showSearch
          allowClear
          filterOption={(input, option) =>
            option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          options={stationOptions}
        />
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      formItemProps: {
        rules: [
          {
            required: true,
            message: '类型为必选项',
          },
        ],
      },
      valueEnum: {
        0: '光伏并网表',
        1: '用户关口表'
      }
    },
    {
      title: ' 计量方向',
      dataIndex: 'direction',
      search: false,
      formItemProps: {
        initialValue: '0',
        rules: [
          {
            required: true,
            message: '计量方向为必选项',
          },
        ],
      },
      valueEnum: {
        0: '正向',
        1: '反向'
      }
    },
    {
      title: 'CT',
      dataIndex: 'ct',
      search: false,
      formItemProps: {
        rules: [
          {
            required: true,
            message: 'ct为必填项',
          },
        ],
      },
    },
    {
      title: 'PT',
      dataIndex: 'pt',
      search: false,
      formItemProps: {
        rules: [
          {
            required: true,
            message: 'pt为必填项',
          },
        ],
      },
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
                type: record.type.toString(),
                direction: record.direction.toString()
              });
            }}
          >
            修改
          </a>
          <Divider type="vertical" />
          <a 
            onClick={async () => {
              Modal.confirm({
                title: '确认删除表计？',
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
        headerTitle="表计"
        actionRef={actionRef}
        rowKey="id"
        toolBarRender={() => [
          <Button key="list" type="primary" onClick={() => handleModalVisible(true)}>
            <PlusOutlined /> 新建
          </Button>
        ]}
        request={(params, sorter, filter) => queryMeter({ ...params, sorter, filter })}
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
                title: '确认删除表计？',
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
        title="新建表计"
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
          title="修改表计"
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

export default Meters;