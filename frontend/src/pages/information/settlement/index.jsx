import React, { useState, useRef } from 'react';
import { Button, DatePicker, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ProForm, { ProFormDatePicker, ProFormDigit, ProFormSelect, ProFormDependency } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import ProCard from '@ant-design/pro-card';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';
import {
  queryStation,
  querySettlement,
  addSettlement,
  updateSettlement,
} from './service';
import styles from './styles.less';

/**
 * 月度结算填报
 * @param fields
 */
const handleAdd = async (fields) => {
  const hide = message.loading('正在创建');

  try {
    await addSettlement({ ...fields });
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
 * 修改月度结算
 * @param fields
 */
const handleUpdate = async (fields) => {
  const hide = message.loading('正在更新');

  try {
    await updateSettlement({ ...fields });
    hide();
    message.success('修改成功');
    return true;
  } catch (error) {
    hide();
    message.error('修改失败请重试！');
    return false;
  }
};

const renderForm = () => (
  <>
    <ProForm.Group>
      <ProFormDatePicker.Month
        name="month"
        label="月份"
        rules={[{ required: true }]}
      />
      <ProFormDatePicker
        name="start_date"
        label="开始日期"
        rules={[{ required: true }]}
      />
      <ProFormDatePicker
        name="end_date"
        label="结束日期"
        rules={[{ required: true }]}
      />
    </ProForm.Group>
    <ProForm.Group>
      <ProFormSelect
        allowClear={false}
        name="type"
        label="类型"
        valueEnum={{
          0: '企业',
          1: '上网',
          2: '国补',
          3: '省补',
        }}
        rules={[{ required: true }]}
      />
      <ProFormSelect
        allowClear={false}
        name="mode"
        label="电价类型"
        initialValue="0"
        valueEnum={{
          0: '单一电价',
          1: '分时电价',
        }}
        rules={[{ required: true }]}
      />
    </ProForm.Group>
    <ProFormDependency name={['mode']}>
      {(values) => {
        if (values.mode === "0") {
          return (
            <ProForm.Group>
              <ProFormDigit
                name="single_price"
                label="单一电价"
                rules={[{ required: true }]}
              />
            </ProForm.Group>
          );
        } if (values.mode === "1") {
          return (
            <ProForm.Group>
              <ProFormDigit
                name="sharp_price"
                label="尖电价"
                rules={[{ required: true }]}
              />
              <ProFormDigit
                name="peak_price"
                label="峰电价"
                rules={[{ required: true }]}
              />
              <ProFormDigit
                name="flat_price"
                label="平电价"
                rules={[{ required: true }]}
              />
              <ProFormDigit
                name="valley_price"
                label="谷电价"
                rules={[{ required: true }]}
              />
            </ProForm.Group>
          );
        } 
        return null;
      }}
    </ProFormDependency>
  </>
);

const SettlementList = (props) => {
  const [formValues, setFormValues] = useState({});
  const [updateModalVisible, handleUpdateModalVisible] = useState(false);
  const [month, setMonth] = useState(null);
  const { station } = props;
  const actionRef = useRef();
  const columns = [
    {
      title: '月份',
      key: 'month',
      dataIndex: 'month',
    },
    {
      title: '开始日期',
      key: 'start_date',
      dataIndex: 'start_date',
      valueType: 'date',
    },
    {
      title: '结束日期',
      key: 'end_date',
      dataIndex: 'end_date',
      valueType: 'date',
    },
    {
      title: '类型',
      key: 'type',
      dataIndex: 'type',
      valueEnum: {
        0: '企业',
        1: '上网',
        2: '国补',
        3: '省补',
      }
    },
    {
      title: '电价类型',
      key: 'mode',
      dataIndex: 'mode',
      valueEnum: {
        0: '单一电价',
        1: '分时电价',
      }
    },
    {
      title: '单一电价',
      key: 'single_price',
      dataIndex: 'single_price',
    },
    {
      title: '尖电价',
      key: 'sharp_price',
      dataIndex: 'sharp_price',
    },
    {
      title: '峰电价',
      key: 'peak_price',
      dataIndex: 'peak_price',
    },
    {
      title: '平电价',
      key: 'flat_price',
      dataIndex: 'flat_price',
    },
    {
      title: '谷电价',
      key: 'valley_price',
      dataIndex: 'valley_price',
    },
    {
      title: '操作',
      key: 'option',
      valueType: 'option',
      render: (_, record) => (
        <a
          onClick={() => {
            handleUpdateModalVisible(true);
            setFormValues({
              ...record,
              type: record.type.toString(),
              mode: record.mode.toString(),
            });
          }}
        >
          修改
        </a>
      )
    },
  ];
  return (
    <>
      <ProTable
        actionRef={actionRef}
        columns={columns}
        params={{
          station: station ? station.id : '',
          month
        }}
        request={async (params, sorter, filter) => {
          if (!station) {
            return {data: []};
          } 
          const response = await querySettlement({ ...params, sorter, filter });
          return response;
        }}
        rowKey="id"
        toolbar={{
          title: station ? station.name : '',
          filter: (
            <DatePicker
              picker="month"
              onChange={(cMonth, monthString) => setMonth(monthString)}
            />
          ),
          actions: [
            <CreateForm
              formNode={renderForm()}
              onFinish={async (values) => {
                const success = await handleAdd({ ...values, station: station.id});
    
                if (success) {
                  if (actionRef.current) {
                    actionRef.current.reload();
                  }
                }
              }}
              trigger={
                <Button
                  key="list"
                  type="primary"
                >
                  <PlusOutlined /> 新建结算
                </Button>
              }
            />,
          ],
        }}
        search={false}
      />
      {formValues && Object.keys(formValues).length ? (
        <UpdateForm
          visible={updateModalVisible}
          formValues={formValues}
          formNode={renderForm()}
          onCancel={() => handleUpdateModalVisible(false)}
          onFinish={async (value) => {
            const success = await handleUpdate({ ...value, id: formValues.id });

            if (success) {
              handleUpdateModalVisible(false);
              setFormValues({});

              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
        />
      ) : null}
    </>
  );
};

const StationList = (props) => {
  const [name, setName] = useState(null);
  const { station, onStationChange  } = props;
  const actionRef = useRef();
  const columns = [
    {
      title: '电站',
      key: 'name',
      dataIndex: 'name',
      search: false,
    },
  ];
  return (
    <ProTable
      actionRef={actionRef}
      columns={columns}
      params={{ name }}
      request={async (params) => {
        const response = await queryStation({ ...params });
        const { data } = response;
        onStationChange(data.length > 0 ? data[0] : null);
        return response;
      }}
      rowKey="id"
      rowClassName={(record) => {
        return station && record.id === station.id ? styles['split-row-select-active'] : '';
      }}
      toolbar={{
        search: {
          onSearch: (value) => setName(value),
        },
      }}
      options={false}
      pagination={false}
      search={false}
      onRow={(record) => {
        return {
          onClick: () => {
            onStationChange(record);
          },
        };
      }}
    />
  );
};

const Settlement = () => {
  const [station, setStation] = useState(null);
  return (
    <PageContainer>
      <ProCard split="vertical">
        <ProCard
          colSpan="280px"
          style={{
            height: '68vh',
            overflow: 'auto',
          }}
          ghost
        >
          <StationList
            station={station}
            onStationChange={(cStation) => setStation(cStation)}
          />
        </ProCard>
        <ProCard>
          <SettlementList station={station}/>
        </ProCard>
      </ProCard>
    </PageContainer>
  );
};
export default Settlement;