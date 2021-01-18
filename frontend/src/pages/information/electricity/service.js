import request from 'umi-request';

export async function queryStationOption() {
  return request('/api/station_option/');
}
export async function queryMeter(params) {
  return request('/api/meter/', {
    params,
  });
}
export async function queryElectricity(params) {
  return request('/api/electricity/', {
    params,
  });
}
export async function addElectricity(params) {
  return request('/api/add_electricity/', {
    method: 'POST',
    data: { ...params },
  });
}
export async function updateElectricity(params) {
  return request('/api/update_electricity/', {
    method: 'POST',
    data: { ...params },
  });
}