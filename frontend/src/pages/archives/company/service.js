import request from 'umi-request';

export async function queryCompany(params) {
  return request('/api/company/', {
    params,
  });
}
export async function removeCompany(params) {
  return request('/api/delete_company/', {
    method: 'POST',
    data: { ...params },
  });
}
export async function addCompany(params) {
  return request('/api/add_company/', {
    method: 'POST',
    data: { ...params },
  });
}
export async function updateCompany(params) {
  return request('/api/update_company/', {
    method: 'POST',
    data: { ...params },
  });
}