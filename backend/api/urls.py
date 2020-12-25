from django.conf.urls import url
from . import views


app_name = 'api.views'


urlpatterns = [
    url(r'^login/$',
        views.login_view,
        name='login'),
    url(r'^logout/$',
        views.logout_view,
        name='logout'),
    url(r'^change_password/$',
        views.change_password_view,
        name='change-password'),
    url(r'^current_user/$',
        views.current_user_view,
        name='current-user'),
    url(r'^company/$',
        views.company_list_view,
        name='company-list'),
    url(r'^add_company/$',
        views.add_company_view,
        name='add-company'),
    url(r'^update_company/$',
        views.update_company_view,
        name='update-company'),
    url(r'^delete_company/$',
        views.delete_company_view,
        name='delete-company'),
]
