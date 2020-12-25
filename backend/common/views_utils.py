import datetime
import json
from decimal import Decimal
from django.core import serializers
from django.http import JsonResponse


def safe_new_date(date):
    return datetime.date(date.year, date.month, date.day)


def safe_new_datetime(date_obj):
    kw = [date_obj.year, date_obj.month, date_obj.day]
    if isinstance(date_obj, datetime.datetime):
        kw.extend([date_obj.hour, date_obj.minute, date_obj.second,
                   date_obj.microsecond, date_obj.tzinfo])
    return datetime.datetime(*kw)


class QuerySetEncoder(json.JSONEncoder):
    """
    Encoding QuerySet into JSON format.
    """
    DATE_FORMAT = "%Y-%m-%d"
    TIME_FORMAT = "%H:%M:%S"

    def default(self, obj):    # pylint: disable=method-hidden
        if isinstance(obj, Decimal):
            return "%d" % obj

        try:
            return serializers.serialize("python", obj,
                                         ensure_ascii=False)
        except Exception:
            if isinstance(obj, Decimal):
                return "%d" % obj
            elif isinstance(obj, datetime.datetime):
                date = safe_new_datetime(obj)
                return date.strftime("%s %s" %
                                     (self.DATE_FORMAT, self.TIME_FORMAT))
            elif isinstance(obj, datetime.date):
                date = safe_new_date(obj)
                return date.strftime(self.DATE_FORMAT)
            elif isinstance(obj, datetime.time):
                return obj.strftime(self.TIME_FORMAT)
            return json.JSONEncoder.default(self, obj)


def json_response(something, status=200):
    return JsonResponse(
        something,
        safe=False,
        encoder=QuerySetEncoder,
        status=status)
