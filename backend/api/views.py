from django.contrib.auth import authenticate, get_user_model, login, logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
import io
import json
from xlsxwriter.workbook import Workbook
from common.debug_utils import debug
from common.views_utils import json_response
from station.models import Company, Station, Settlement, Meter, Electricity


User = get_user_model()


@csrf_exempt
def login_view(request):
    params = json.loads(request.body)
    username = params.get('userName')
    password = params.get('password')
    user = authenticate(request, username=username, password=password)
    debug(user)
    response = {}
    if user is not None:
        login(request, user)
        authority = 'admin' if user.is_admin else 'user'
        # authority = 'user'
        debug(user.is_admin)
        response = {
            'status': 'ok',
            'currentAuthority': authority
        }
    else:
        response = {
            'status': 'error',
            'currentAuthority': 'guest'
        }

    return json_response(response)


def logout_view(request):
    logout(request)
    return json_response({'status': 'ok'})


@csrf_exempt
@login_required
def change_password_view(request):
    params = json.loads(request.body)
    password = params.get('password')
    user = request.user
    user.set_password(password)
    user.save()

    return json_response({'status': 'ok'})


@login_required
def current_user_view(request):
    user = request.user
    return json_response({'name': user.name, 'userid': user.id})


@login_required
def company_list_view(request):
    params = request.GET
    page_size = int(params.get('pageSize'))
    current = int(params.get('current'))
    start_index = (current - 1) * page_size
    end_index = current * page_size
    company_list = Company.objects.all()
    name = params.get('name', None)
    if name:
        company_list = company_list.filter(name__icontains=name)

    return json_response({
        'data': [
            company.to_dict()
            for company in company_list[start_index:end_index]
        ],
        'total': company_list.count(),
        'success': True,
        'pageSize': page_size,
        'current': current
    })


@csrf_exempt
@login_required
def add_company_view(request):
    params = json.loads(request.body)
    company = Company()
    company.name = params.get('name')
    company.save()

    return json_response(company.to_dict())


@csrf_exempt
@login_required
def update_company_view(request):
    params = json.loads(request.body)
    id = params.get('id')
    company = Company.objects.get(pk=id)
    company.name = params.get('name')
    company.save()

    return json_response(company.to_dict())


@csrf_exempt
@login_required
def delete_company_view(request):
    params = json.loads(request.body)
    ids = params.get('ids', [])
    for id in ids:
        Company.objects.get(pk=id).delete()

    return json_response({})


@login_required
def company_option_view(request):
    companies = []
    for company in Company.objects.all():
        companies.append({
            'value': company.id,
            'label': company.name
        })

    return json_response({'companies': companies})


@login_required
def station_list_view(request):
    params = request.GET
    station_list = Station.objects.all()
    name = params.get('name', None)
    if name:
        station_list = station_list.filter(name__icontains=name)
    company_id = params.get('company', None)
    if company_id:
        station_list = station_list.filter(company__id=company_id)

    total = station_list.count()

    page_size = params.get('pageSize', None)
    current = params.get('current', None)
    if page_size and current:
        start_index = (int(current) - 1) * int(page_size)
        end_index = int(current) * int(page_size)
        station_list = station_list[start_index:end_index]

    return json_response({
        'data': [station.to_dict() for station in station_list],
        'total': total,
        'success': True,
        'pageSize': page_size,
        'current': current
    })


@csrf_exempt
@login_required
def add_station_view(request):
    params = json.loads(request.body)
    company_id = params.get('company')
    company = Company.objects.get(id=company_id)
    station = Station()
    station.name = params.get('name')
    station.capacity = params.get('capacity')
    station.mode = params.get('mode')
    station.is_self_consume = params.get('is_self_consume')
    station.company = company
    station.save()

    return json_response(station.to_dict())


@csrf_exempt
@login_required
def update_station_view(request):
    params = json.loads(request.body)
    id = params.get('id')
    company_id = params.get('company')
    company = Company.objects.get(id=company_id)
    station = Station.objects.get(pk=id)
    station.name = params.get('name')
    station.capacity = params.get('capacity')
    station.mode = params.get('mode')
    station.is_self_consume = params.get('is_self_consume')
    station.company = company
    station.save()

    return json_response(station.to_dict())


@csrf_exempt
@login_required
def delete_station_view(request):
    params = json.loads(request.body)
    ids = params.get('ids', [])
    for id in ids:
        Station.objects.get(pk=id).delete()

    return json_response({})


@login_required
def station_option_view(request):
    station_list = Station.objects.all()
    stations = []
    for station in station_list:
        stations.append({
            'value': station.id,
            'label': station.name
        })

    return json_response({'stations': stations})


@login_required
def meter_list_view(request):
    meter_list = Meter.objects.all().order_by('station')
    params = request.GET
    name = params.get('name', None)
    if name:
        meter_list = meter_list.filter(name__icontains=name)
    station_id = params.get('station', None)
    if station_id:
        meter_list = meter_list.filter(station__id=station_id)
    type = params.get('type', None)
    if type:
        meter_list = meter_list.filter(type=type)
    direction = params.get('direction', None)
    if direction:
        meter_list = meter_list.filter(direction=direction)

    total = meter_list.count()

    page_size = params.get('pageSize', None)
    current = params.get('current', None)
    if page_size and current:
        start_index = (int(current) - 1) * int(page_size)
        end_index = int(current) * int(page_size)
        meter_list = meter_list[start_index:end_index]

    return json_response({
        'data': [meter.to_dict() for meter in meter_list],
        'total': total,
        'success': True,
        'pageSize': page_size,
        'current': current
    })


@csrf_exempt
@login_required
def add_meter_view(request):
    params = json.loads(request.body)
    station_id = params.get('station')
    station = Station.objects.get(id=station_id)
    meter = Meter()
    meter.name = params.get('name')
    meter.station = station
    meter.type = params.get('type')
    meter.direction = params.get('direction')
    meter.ct = params.get('ct')
    meter.pt = params.get('pt')

    number = params.get('number', None)
    if number:
        meter.number = number

    meter.save()

    return json_response(meter.to_dict())


@csrf_exempt
@login_required
def update_meter_view(request):
    params = json.loads(request.body)
    id = params.get('id')
    station_id = params.get('station')
    station = Station.objects.get(id=station_id)
    meter = Meter.objects.get(pk=id)
    meter.name = params.get('name')
    meter.station = station
    meter.type = params.get('type')
    meter.direction = params.get('direction')
    meter.ct = params.get('ct')
    meter.pt = params.get('pt')

    number = params.get('number', None)
    if number:
        meter.number = number

    meter.save()

    return json_response(meter.to_dict())


@csrf_exempt
@login_required
def delete_meter_view(request):
    params = json.loads(request.body)
    ids = params.get('ids', [])
    for id in ids:
        Meter.objects.get(pk=id).delete()

    return json_response({})


@login_required
def electricity_list_view(request):
    params = request.GET
    meter_id = params.get('meter')
    electricity_list = Electricity.objects\
                                  .filter(meter__id=meter_id)\
                                  .order_by('-date')

    start_date = params.get('startDate', None)
    if start_date:
        electricity_list = electricity_list.filter(date__gte=start_date)
    end_date = params.get('endDate', None)
    if end_date:
        electricity_list = electricity_list.filter(end_date__lte=end_date)

    page_size = int(params.get('pageSize'))
    current = int(params.get('current'))
    start_index = (current - 1) * page_size
    end_index = current * page_size

    return json_response({
        'data': [
            electricity.to_dict()
            for electricity in electricity_list[start_index:end_index]
        ],
        'total': electricity_list.count(),
        'success': True,
        'pageSize': page_size,
        'current': current
    })


@csrf_exempt
@login_required
def add_electricity_view(request):
    params = json.loads(request.body)
    date = params.get('date')
    forward_total = params.get('forward_total')
    forward_sharp = params.get('forward_sharp')
    forward_peak = params.get('forward_peak')
    forward_flat = params.get('forward_flat')
    forward_valley = params.get('forward_valley')
    reverse_total = params.get('reverse_total')
    reverse_sharp = params.get('reverse_sharp')
    reverse_peak = params.get('reverse_peak')
    reverse_flat = params.get('reverse_flat')
    reverse_valley = params.get('reverse_valley')
    meter_id = params.get('meter')
    meter = Meter.objects.get(id=meter_id)
    electricity = Electricity()
    electricity.date = date
    electricity.meter = meter
    electricity.forward_total = forward_total
    electricity.forward_sharp = forward_sharp
    electricity.forward_peak = forward_peak
    electricity.forward_flat = forward_flat
    electricity.forward_valley = forward_valley
    electricity.reverse_total = reverse_total
    electricity.reverse_sharp = reverse_sharp
    electricity.reverse_peak = reverse_peak
    electricity.reverse_flat = reverse_flat
    electricity.reverse_valley = reverse_valley
    electricity.save()

    return json_response(electricity.to_dict())


@csrf_exempt
@login_required
def update_electricity_view(request):
    params = json.loads(request.body)
    date = params.get('date')
    forward_total = params.get('forward_total')
    forward_sharp = params.get('forward_sharp')
    forward_peak = params.get('forward_peak')
    forward_flat = params.get('forward_flat')
    forward_valley = params.get('forward_valley')
    reverse_total = params.get('reverse_total')
    reverse_sharp = params.get('reverse_sharp')
    reverse_peak = params.get('reverse_peak')
    reverse_flat = params.get('reverse_flat')
    reverse_valley = params.get('reverse_valley')
    id = params.get('id')
    electricity = Electricity.objects.get(pk=id)
    electricity.date = date
    electricity.forward_total = forward_total
    electricity.forward_sharp = forward_sharp
    electricity.forward_peak = forward_peak
    electricity.forward_flat = forward_flat
    electricity.forward_valley = forward_valley
    electricity.reverse_total = reverse_total
    electricity.reverse_sharp = reverse_sharp
    electricity.reverse_peak = reverse_peak
    electricity.reverse_flat = reverse_flat
    electricity.reverse_valley = reverse_valley
    electricity.save()

    return json_response(electricity.to_dict())


@login_required
def settlement_list_view(request):
    params = request.GET
    station_id = params.get('station')
    settlement_list = Settlement.objects\
                                .filter(station__id=station_id)\
                                .order_by('-month')

    month = params.get('month', None)
    if month:
        settlement_list = settlement_list.filter(month=month + '-01')

    page_size = int(params.get('pageSize'))
    current = int(params.get('current'))
    start_index = (current - 1) * page_size
    end_index = current * page_size

    return json_response({
        'data': [
            settlement.to_dict()
            for settlement in settlement_list[start_index:end_index]
        ],
        'total': settlement_list.count(),
        'success': True,
        'pageSize': page_size,
        'current': current
    })


@csrf_exempt
@login_required
def add_settlement_view(request):
    params = json.loads(request.body)
    station_id = params.get('station')
    station = Station.objects.get(id=station_id)

    settlement = Settlement()
    settlement.station = station
    settlement.month = params.get('month') + '-01'
    settlement.start_date = params.get('start_date')
    settlement.end_date = params.get('end_date')
    settlement.type = params.get('type')
    settlement.mode = params.get('mode')

    single_price = params.get('single_price', None)
    if single_price:
        settlement.single_price = single_price
    sharp_price = params.get('sharp_price', None)
    if sharp_price:
        settlement.sharp_price = sharp_price
    peak_price = params.get('peak_price', None)
    if peak_price:
        settlement.peak_price = peak_price
    flat_price = params.get('flat_price', None)
    if flat_price:
        settlement.flat_price = flat_price
    valley_price = params.get('valley_price', None)
    if valley_price:
        settlement.valley_price = valley_price

    discount = params.get('discount', None)
    if discount:
        settlement.discount = discount

    # For direct purchase
    direct_purchase_percent = params.get('direct_purchase_percent', None)
    if direct_purchase_percent:
        settlement.direct_purchase_percent = direct_purchase_percent
    direct_purchase_sharp_price = params.get(
        'direct_purchase_sharp_price', None)
    if direct_purchase_sharp_price:
        settlement.direct_purchase_sharp_price = direct_purchase_sharp_price
    direct_purchase_peak_price = params.get('direct_purchase_peak_price', None)
    if direct_purchase_peak_price:
        settlement.direct_purchase_peak_price = direct_purchase_peak_price
    direct_purchase_flat_price = params.get('direct_purchase_flat_price', None)
    if direct_purchase_flat_price:
        settlement.direct_purchase_flat_price = direct_purchase_flat_price
    direct_purchase_valley_price = params.get(
        'direct_purchase_valley_price', None)
    if direct_purchase_valley_price:
        settlement.direct_purchase_valley_price = direct_purchase_valley_price
    # End for direct purchase

    settlement.save()

    return json_response(settlement.to_dict())


@csrf_exempt
@login_required
def update_settlement_view(request):
    params = json.loads(request.body)
    id = params.get('id')
    settlement = Settlement.objects.get(pk=id)
    settlement.month = params.get('month') + '-01'
    settlement.start_date = params.get('start_date')
    settlement.end_date = params.get('end_date')
    settlement.type = params.get('type')
    settlement.mode = params.get('mode')

    single_price = params.get('single_price', None)
    if single_price:
        settlement.single_price = single_price
    sharp_price = params.get('sharp_price', None)
    if sharp_price:
        settlement.sharp_price = sharp_price
    peak_price = params.get('peak_price', None)
    if peak_price:
        settlement.peak_price = peak_price
    flat_price = params.get('flat_price', None)
    if flat_price:
        settlement.flat_price = flat_price
    valley_price = params.get('valley_price', None)
    if valley_price:
        settlement.valley_price = valley_price

    discount = params.get('discount', None)
    if discount:
        settlement.discount = discount

    # For direct purchase
    direct_purchase_percent = params.get('direct_purchase_percent', None)
    if direct_purchase_percent:
        settlement.direct_purchase_percent = direct_purchase_percent
    direct_purchase_sharp_price = params.get(
        'direct_purchase_sharp_price', None)
    if direct_purchase_sharp_price:
        settlement.direct_purchase_sharp_price = direct_purchase_sharp_price
    direct_purchase_peak_price = params.get('direct_purchase_peak_price', None)
    if direct_purchase_peak_price:
        settlement.direct_purchase_peak_price = direct_purchase_peak_price
    direct_purchase_flat_price = params.get('direct_purchase_flat_price', None)
    if direct_purchase_flat_price:
        settlement.direct_purchase_flat_price = direct_purchase_flat_price
    direct_purchase_valley_price = params.get(
        'direct_purchase_valley_price', None)
    if direct_purchase_valley_price:
        settlement.direct_purchase_valley_price = direct_purchase_valley_price
    # End for direct purchase

    settlement.save()

    return json_response(settlement.to_dict())


@login_required
def bill_list_view(request):
    params = request.GET
    month = params.get('month')
    settlement_list = Settlement.objects\
                                .filter(month=month + '-01')\
                                .order_by('station__company',
                                          'station__mode',
                                          'station',
                                          'type')

    total = settlement_list.count()
    next_index = 0
    company_row_count = 0
    company_list = []
    data = []
    for settlement in settlement_list:
        next_index += 1
        settlement_dict = settlement.to_bill_dict()
        company = settlement_dict['company']
        if company not in company_list:
            company_list.append(company)

        next_settlement = settlement_list[next_index] \
            if total > next_index else None

        if (next_settlement and
                settlement.station.company.id ==
                next_settlement.station.company.id):
            company_row_count += 1

        data.append(settlement_dict)

    return json_response({
        'data': data,
        'total': total,
        'success': True,
    })


@login_required
def export_bill_view(request):
    params = request.GET
    debug(params)
    month = params.get('month')

    return json_response({})

    '''
    output = io.BytesIO()

    workbook = Workbook(output)

    workbook.add_format({'text_wrap': True})

    worksheet = workbook.add_worksheet()

    worksheet.write(0, 0, '主题')
    worksheet.write(0, 1, '描述')
    worksheet.write(0, 2, '部门')
    worksheet.write(0, 3, '提议者')
    worksheet.write(0, 4, '时间')

    row = 1
    for idea in ideas:
        worksheet.write(row, 0, idea.title)
        worksheet.write(row, 1, idea.description)
        worksheet.write(row, 2, idea.user.department.name)
        worksheet.write(row, 3, idea.user.name)
        worksheet.write(
            row, 4, idea.created_datetime.strftime("%Y-%m-%d %H:%M:%S"))
        row += 1

    workbook.close()

    output.seek(0)

    filename = '金点子'

    start_timestamp = request.GET.get('start', '')
    if start_timestamp:
        start_date = datetime.fromtimestamp(int(start_timestamp) / 1000)
        filename += start_date.strftime("%Y%m%d")

    end_timestamp = request.GET.get('end', '')
    if end_timestamp:
        end_date = datetime.fromtimestamp(int(end_timestamp) / 1000)
        filename += '-' + end_date.strftime("%Y%m%d")

    debug(filename)

    response = HttpResponse(
        output.read(),
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        charset='utf-8')
    response['Content-Disposition'] = "attachment; filename=%s.xlsx" % escape_uri_path(
        filename)

    output.close()

    return response
    '''
