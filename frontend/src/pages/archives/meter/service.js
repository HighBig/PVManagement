import request from 'umi-request';

export async function queryStationSelectOption() {
  return request('/api/station_select_option/');
}
export async function queryMeter(params) {
  return request('/api/meter/', {
    params,
  });
}
export async function removeMeter(params) {
  return request('/api/delete_meter/', {
    method: 'POST',
    data: { ...params },
  });
}
export async function addMeter(params) {
  return request('/api/add_meter/', {
    method: 'POST',
    data: { ...params },
  });
}
export async function updateMeter(params) {
  return request('/api/update_meter/', {
    method: 'POST',
    data: { ...params },
  });
}