import request from 'umi-request';

export async function changePassword(params) {
  return request('/api/change_password/', {
    method: 'POST',
    data: params,
  });
}