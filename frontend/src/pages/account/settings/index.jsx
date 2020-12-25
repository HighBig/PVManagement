import React, { Component } from 'react';
import { connect, FormattedMessage, formatMessage } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Card, Input, Form } from 'antd';

class Settings extends Component {
  handleFinish = (values) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'accountAndsettings/changePassword',
      payload: { ...values },
    });
  };

  render() {
    const formItemLayout = {
      labelCol: {
        xs: {
          span: 24,
        },
        sm: {
          span: 7,
        },
      },
      wrapperCol: {
        xs: {
          span: 24,
        },
        sm: {
          span: 12,
        },
        md: {
          span: 10,
        },
      },
    };
  
    const submitFormLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 10,
          offset: 7,
        },
      },
    };

    return (
      <PageContainer content={<FormattedMessage id="accountandsettings.changePassword.description" />}>
        <Card bordered={false}>
          <Form
            onFinish={this.handleFinish}
            hideRequiredMark
          >
            <Form.Item
              {...formItemLayout}
              name="password"
              label={formatMessage({
                id: 'accountandsettings.changePassword.password',
              })}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: formatMessage(
                    {
                      id: 'accountandsettings.changePassword.password-message',
                    },
                    {},
                  ),
                },
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              {...formItemLayout}
              name="confirmPassword"
              label={formatMessage({
                id: 'accountandsettings.changePassword.confirm-password',
              })}
              dependencies={['password']}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: formatMessage(
                    {
                      id: 'accountandsettings.changePassword.confirm-password-message',
                    },
                    {},
                  ),
                },
                ({ getFieldValue }) => ({
                  validator(rule, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
      
                    return Promise.reject(formatMessage({
                      id: 'accountandsettings.changePassword.password-diff',
                    }));
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              {...submitFormLayout}
            >
              <Button htmlType="submit" type="primary" loading={this.props.submitting}>
                <FormattedMessage
                  id="accountandsettings.basic.update"
                  defaultMessage="修改密码"
                />
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </PageContainer>
    );
  }
}

export default connect(({ accountAndsettings, loading }) => ({
  isPasswordCorrect: accountAndsettings.isPasswordCorrect,
  submitting: loading.effects['accountAndsettings/changePassword'],
}))(Settings);
