import React, { useEffect, useState, useRef } from 'react';
import { Button, DatePicker, message, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ProForm, { ProFormDatePicker, ProFormDigit } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import ProCard from '@ant-design/pro-card';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';
import {
  queryStationSelectOption,
  queryMeter,
  queryElectricity,
  addElectricity,
  updateElectricity,
} from './service';
import styles from './styles.less';

/**
 * 电量填报
 * @param fields
 */
const handleAdd = async (fields) => {
  const hide = message.loading('正在创建');

  try {
    await addElectricity({ ...fields });
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
 * 修改电量
 * @param fields
 */
const handleUpdate = async (fields) => {
  const hide = message.loading('正在更新');

  try {
    await updateElectricity({ ...fields });
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
      <ProFormDatePicker
        name="date"
        label="日期"
        rules={[{ required: true }]}
      />
    </ProForm.Group>
    <ProForm.Group>
      <ProFormDigit
        name="forward_total"
        label="正向总"
        rules={[{ required: true }]}
      />
      <ProFormDigit
        name="forward_sharp"
        label="正向尖"
        rules={[{ required: true }]}
      />
      <ProFormDigit
        name="forward_peak"
        label="正向峰"
        rules={[{ required: true }]}
      />
      <ProFormDigit
        name="forward_flat"
        label="正向平"
        rules={[{ required: true }]}
      />
      <ProFormDigit
        name="forward_valley"
        label="正向谷"
        rules={[{ required: true }]}
      />
    </ProForm.Group>
    <ProForm.Group>
      <ProFormDigit
        name="reverse_total"
        label="反向总"
        rules={[{ required: true }]}
      />
      <ProFormDigit
        name="reverse_sharp"
        label="反向尖"
        rules={[{ required: true }]}
      />
      <ProFormDigit
        name="reverse_peak"
        label="反向峰"
        rules={[{ required: true }]}
      />
      <ProFormDigit
        name="reverse_flat"
        label="反向平"
        rules={[{ required: true }]}
      />
      <ProFormDigit
        name="reverse_valley"
        label="反向谷"
        rules={[{ required: true }]}
      />
    </ProForm.Group>
  </>
);

const ElectricityList = (props) => {
  const [formValues, setFormValues] = useState({});
  const [updateModalVisible, handleUpdateModalVisible] = useState(false);
  const [dates, setDates] = useState([]);
  const { meter } = props;
  const actionRef = useRef();
  const columns = [
    {
      title: '日期',
      key: 'date',
      dataIndex: 'date',
      valueType: 'date',
      formItemProps: {
        rules: [
          {
            required: true,
            message: '日期为必选项',
          },
        ],
      },
    },
    {
      title: '正向总',
      key: 'forward_total',
      dataIndex: 'forward_total',
      valueType: 'digit',
      formItemProps: {
        rules: [
          {
            required: true,
            message: '正向总为必填项',
          },
        ],
      },
    },
    {
      title: '正向尖',
      key: 'forward_sharp',
      dataIndex: 'forward_sharp',
      valueType: 'digit',
    },
    {
      title: '正向峰',
      key: 'forward_peak',
      dataIndex: 'forward_peak',
      valueType: 'digit',
    },
    {
      title: '正向平',
      key: 'forward_flat',
      dataIndex: 'forward_flat',
      valueType: 'digit',
    },
    {
      title: '正向谷',
      key: 'forward_valley',
      dataIndex: 'forward_valley',
      valueType: 'digit',
    },
    {
      title: '反向总',
      key: 'reverse_total',
      dataIndex: 'reverse_total',
      valueType: 'digit',
      formItemProps: {
        rules: [
          {
            required: true,
            message: '反向总为必填项',
          },
        ],
      },
    },
    {
      title: '反向尖',
      key: 'reverse_sharp',
      dataIndex: 'reverse_sharp',
      valueType: 'digit',
    },
    {
      title: '反向峰',
      key: 'reverse_peak',
      dataIndex: 'reverse_peak',
      valueType: 'digit',
    },
    {
      title: '反向平',
      key: 'reverse_flat',
      dataIndex: 'reverse_flat',
      valueType: 'digit',
    },
    {
      title: '反向谷',
      key: 'reverse_valley',
      dataIndex: 'reverse_valley',
      valueType: 'digit',
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
          meter: meter ? meter.id : '',
          startDate: dates.length > 0 ? dates[0]: null,
          endDate: dates.length > 1 ? dates[1]: null
        }}
        request={async (params, sorter, filter) => {
          if (!meter) {
            return {data: []};
          } 
          const response = await queryElectricity({ ...params, sorter, filter });
          return response;
        }}
        rowKey="id"
        toolbar={{
          title: meter ? meter.name : '',
          filter: (
            <DatePicker.RangePicker
              onChange={(cDates, dateStrings) => setDates(dateStrings)}
            />
          ),
          actions: [
            <CreateForm
              formNode={renderForm()}
              onFinish={async (values) => {
                const success = await handleAdd({ ...values, meter: meter.id});
    
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
                  <PlusOutlined /> 电量填报
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

const MeterList = (props) => {
  const [stations, setStations] = useState([]);
  const [station, setStation] = useState(null);
  const { meter, onMeterChange  } = props;
  const actionRef = useRef();
  useEffect(() => {
    queryStationSelectOption().then(result => {
      setStations(result.stations);
    });
  }, []);
  const columns = [
    {
      title: '表计',
      key: 'name',
      dataIndex: 'name',
      search: false,
    },
  ];
  return (
    <ProTable
      actionRef={actionRef}
      columns={columns}
      params={{
        station
      }}
      request={async (params) => {
        const response = await queryMeter({ ...params });
        const { data } = response;
        onMeterChange(data.length > 0 ? data[0] : null);
        return response;
      }}
      rowKey="id"
      rowClassName={(record) => {
        return meter && record.id === meter.id ? styles['split-row-select-active'] : '';
      }}
      toolbar={{
        filter: (
          <Select
            style={{width: '228px'}}
            placeholder="请选择电站"
            showSearch
            allowClear
            filterOption={(input, option) =>
              option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            options={stations}
            onChange={(value) => {
              setStation(value);
            }}
          />
        ),
      }}
      options={false}
      pagination={false}
      search={false}
      onRow={(record) => {
        return {
          onClick: () => {
            onMeterChange(record);
          },
        };
      }}
    />
  );
};

const Electricity = () => {
  const [meter, setMeter] = useState(null);
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
          <MeterList
            meter={meter}
            onMeterChange={(cMeter) => setMeter(cMeter)}
          />
        </ProCard>
        <ProCard>
          <ElectricityList meter={meter}/>
        </ProCard>
      </ProCard>
    </PageContainer>
  );
};
export default Electricity;