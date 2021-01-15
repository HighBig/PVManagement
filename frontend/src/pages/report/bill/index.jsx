import { Button, DatePicker } from 'antd';
import React, { useState, useRef } from 'react';
import { ExportOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import moment from 'moment';
import { queryCompanyOption, queryStationOption, queryBill  } from './service';

const Bill = () => {
  const actionRef = useRef();
  const [month, setMonth] = useState(moment());
  const columns = [
    {
      title: '公司',
      dataIndex: 'company',
      valueType: 'select',
      fieldProps: {
        showSearch: true,
        filterOption: (input, option) =>
          option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
      },
      request: async () => {
        const response = await queryCompanyOption();
        return response.companies;
      }
    },
    {
      title: '模式',
      dataIndex: 'mode',
      valueEnum: {
        0: '自发自用',
        1: '全额上网',
      },
    },
    {
      title: '电站',
      dataIndex: 'station',
      valueType: 'select',
      fieldProps: {
        showSearch: true,
        filterOption: (input, option) =>
          option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
      },
      request: async () => {
        const response = await queryStationOption();
        return response.stations;
      }
    },
    {
      title: '时间段',
      dataIndex: 'period',
    },
    {
      title: '类别',
      dataIndex: 'type',
      valueEnum: {
        0: '企业',
        1: '上网',
        2: '国补',
        3: '省补',
      },
    },
    {
      title: '电量(kWh)',
      dataIndex: 'power',
      render: (dom) => (<div style={{ 'whiteSpace': 'pre-line' }}>{dom}</div>)
    },
    {
      title: '电价(元)',
      dataIndex: 'price',
      render: (dom) => (<div style={{ 'whiteSpace': 'pre-line' }}>{dom}</div>)
    },
    {
      title: '电费(元)',
      dataIndex: 'bill',
    },
    {
      title: '金额(元)',
      dataIndex: 'amount',
    },
    {
      title: '税额(元)',
      dataIndex: 'tax',
    },
  ];
  return (
    <PageContainer>
      <ProTable
        headerTitle="电费"
        actionRef={actionRef}
        rowKey="id"
        params={{
          month: month.format('YYYY-MM')
        }}
        request={(params, sorter, filter) => queryBill({ ...params, sorter, filter })}
        columns={columns}
        pagination={false}
        search={false}
        toolbar={{
          filter: (
            <DatePicker
              allowClear={false}
              picker="month"
              defaultValue={month}
              onChange={(cMonth) => setMonth(cMonth)}
            />
          ),
        }}
      />
    </PageContainer>
  );
};

export default Bill;