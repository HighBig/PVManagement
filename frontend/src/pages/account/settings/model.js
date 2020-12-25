import { message } from 'antd';
import { formatMessage } from 'umi';
import { changePassword } from './service';

function delay(timeout){
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
}

const Model = {
  namespace: 'accountAndsettings',
  state: {
    status: undefined,
    isPasswordCorrect: true,
  },
  effects: {
    *changePassword({ payload }, { call, put }) {
      const response = yield call(changePassword, payload);
      yield put({
        type: 'changeStatus',
        payload: response,
      });

      if (response.status === 'ok') {
        message.success(
          formatMessage({
            id: 'accountandsettings.basic.update.success',
          }),
        );
        yield call(delay, 1000);
        window.location.href = '/user/login';
      } else {
        console.log('password error');
        yield put({
          type: 'changePasswordStatus',
        });
      }
    },
  },
  reducers: {
    changeStatus(state, { payload }) {
      return { ...state, status: payload.status };
    },
    changePasswordStatus(state) {
      return { ...state, isPasswordCorrect: false};
    }
  },
};
export default Model;
