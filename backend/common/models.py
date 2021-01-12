from django.db import models
from django.utils import timezone
from django.db.models.fields.related import ManyToManyField
from django.db.models import DateTimeField, DecimalField
from common.models_utils import decimal2string


class BaseModel(models.Model):
    created_datetime = DateTimeField(auto_now_add=True)
    modified_datetime = DateTimeField("last modified datetime", blank=True)

    def save(self, *args, **kwargs):
        if not kwargs.pop('skip_modified_datetime', False):
            self.modified_datetime = timezone.now()
        super(BaseModel, self).save(*args, **kwargs)

    class Meta:
        abstract = True


class PrintableModel(models.Model):
    def to_dict(self, exclude_fields=[]):
        opts = self._meta
        data = {}

        for field in opts.concrete_fields + opts.many_to_many:
            if field.name in exclude_fields:
                continue

            if isinstance(field, ManyToManyField):
                if self.pk is None:
                    data[field.name] = []
                else:
                    pk_list = []
                    if getattr(self, "%s_ids" % field.name, None) is not None:
                        obj_list = getattr(self, "%s_ids" % field.name)
                        pk_list = [obj.pk for obj in obj_list]
                    else:
                        pk_list = list(field.value_from_object(
                            self).values_list('pk', flat=True))
                    data[field.name] = pk_list
            elif (isinstance(field, DecimalField)):
                field_value = field.value_from_object(self)
                if field_value or field_value == 0:
                    data[field.name] = decimal2string(field_value)
                else:
                    data[field.name] = ''
            else:
                data[field.name] = field.value_from_object(self)

        return data

    class Meta:
        abstract = True
