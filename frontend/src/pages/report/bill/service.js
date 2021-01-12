import request from 'umi-request';

export async function queryCompanyOption() {
  return request('/api/company_option/');
}
export async function queryStationOption() {
  return request('/api/station_option/');
}
export async function queryBill(params) {
  return request('/api/bill/', {
    params,
  });
}