import request from 'umi-request';

export async function queryCurrent() {
  return request('/api/currentUser');
}
export async function queryProvince() {
  return request('/api/geographic/province');
}
export async function queryCity(province) {
  return request(`/api/geographic/city/${province}`);
}
export async function query() {
  return request('/api/users');
}

export async function queryRule(params) {
  return request('/api/rule', {
    params,
  });
}
export async function removeRule(params) {
  return request('/api/rule', {
    method: 'POST',
    data: { ...params, method: 'delete' },
  });
}
export async function addRule(params) {
  return request('/api/rule', {
    method: 'POST',
    data: { ...params, method: 'post' },
  });
}
export async function updateRule(params) {
  return request('/api/rule', {
    method: 'POST',
    data: { ...params, method: 'update' },
  });
}

export async function queryStation(params) {
  return request('/api/station', {
    params,
  });
}
export async function removeStation(params) {
  return request('/api/station', {
    method: 'POST',
    data: { ...params, method: 'delete' },
  });
}
export async function addStation(params) {
  return request('/api/station', {
    method: 'POST',
    data: { ...params, method: 'post' },
  });
}
export async function updateStation(params) {
  return request('/api/station', {
    method: 'POST',
    data: { ...params, method: 'update' },
  });
}