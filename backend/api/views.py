from django.contrib.auth import authenticate, get_user_model, login, logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
import json
from common.debug_utils import debug
from common.views_utils import json_response
from station.models import Company, Station, Settlement, Meter, Electricity


User = get_user_model()


@csrf_exempt
def login_view(request):
    params = json.loads(request.body)
    username = params.get('userName')
    password = params.get('password')
    debug(username, password)
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
    debug(password)
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
    debug(params)
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
    debug(params)
    name = params.get('name')
    short_name = params.get('short_name')
    company = Company()
    company.name = name
    company.short_name = short_name
    company.save()

    return json_response(company.to_dict())


@csrf_exempt
@login_required
def update_company_view(request):
    params = json.loads(request.body)
    debug(params)
    id = params.get('id')
    name = params.get('name')
    short_name = params.get('short_name')
    company = Company.objects.get(pk=id)
    company.name = name
    company.short_name = short_name
    company.save()

    return json_response(company.to_dict())


@csrf_exempt
@login_required
def delete_company_view(request):
    params = json.loads(request.body)
    debug(params)
    ids = params.get('ids', [])
    debug(ids)
    for id in ids:
        Company.objects.get(pk=id).delete()

    return json_response({})
