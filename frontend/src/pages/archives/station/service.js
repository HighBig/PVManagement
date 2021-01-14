import request from 'umi-request';

export async function queryCompanySelectOption() {
  return request('/api/company_select_option/');
}
export async function queryStation(params) {
  return request('/api/station/', {
    params,
  });
}
export async function removeStation(params) {
  return request('/api/delete_station/', {
    method: 'POST',
    data: { ...params },
  });
}
export async function addStation(params) {
  return request('/api/add_station/', {
    method: 'POST',
    data: { ...params },
  });
}
export async function updateStation(params) {
  return request('/api/update_station/', {
    method: 'POST',
    data: { ...params },
  });
}