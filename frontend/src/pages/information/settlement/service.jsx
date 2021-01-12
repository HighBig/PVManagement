import request from 'umi-request';

export async function queryStation(params) {
  return request('/api/station/', {
    params,
  });
}
export async function querySettlement(params) {
  return request('/api/settlement/', {
    params,
  });
}
export async function addSettlement(params) {
  return request('/api/add_settlement/', {
    method: 'POST',
    data: { ...params },
  });
}
export async function updateSettlement(params) {
  return request('/api/update_settlement/', {
    method: 'POST',
    data: { ...params },
  });
}