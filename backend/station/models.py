from django.db import models
from django.conf import settings
from common.models import BaseModel, PrintableModel
from station.models_utils import get_power
from common.models_utils import decimal2string
from common.debug_utils import debug


class Company(BaseModel, PrintableModel):
    name = models.CharField(max_length=512)

    def __str__(self):
        return self.name


class Station(BaseModel, PrintableModel):
    name = models.CharField(max_length=512)
    capacity = models.DecimalField(
        max_digits=16,
        decimal_places=4
    )
    mode = models.IntegerField(
        choices=(
            (0, '自发自用'),
            (1, '全额上网'),
        )
    )
    company = models.ForeignKey(
        'station.Company',
        on_delete=models.CASCADE
    )

    def __str__(self):
        return self.name


class Settlement(BaseModel, PrintableModel):
    station = models.ForeignKey(
        'station.Station',
        on_delete=models.CASCADE
    )
    month = models.DateField()
    start_date = models.DateField()
    end_date = models.DateField()
    type = models.IntegerField(
        choices=(
            (0, '企业'),
            (1, '上网'),
            (2, '国补'),
            (3, '省补')
        )
    )
    mode = models.IntegerField(
        choices=(
            (0, '单一电价'),
            (1, '分时电价'),
        )
    )
    single_price = models.DecimalField(
        blank=True,
        null=True,
        max_digits=16,
        decimal_places=4
    )
    sharp_price = models.DecimalField(
        blank=True,
        null=True,
        max_digits=16,
        decimal_places=4
    )
    peak_price = models.DecimalField(
        blank=True,
        null=True,
        max_digits=16,
        decimal_places=4
    )
    flat_price = models.DecimalField(
        blank=True,
        null=True,
        max_digits=16,
        decimal_places=4
    )
    valley_price = models.DecimalField(
        blank=True,
        null=True,
        max_digits=16,
        decimal_places=4
    )

    def to_dict(self):
        normalized_dict = super(Settlement, self).to_dict()
        month = self.month
        if not isinstance(month, str):
            month = month.strftime('%Y-%m')
        normalized_dict['month'] = month
        return normalized_dict

    def to_bill_dict(self):
        bill_dict = self.to_dict()
        station = self.station
        start_date = bill_dict['start_date']
        end_date = bill_dict['end_date']
        bill_dict['company'] = station.company.id
        bill_dict['period'] = '%s~%s' % (start_date, end_date)
        bill_dict['mode'] = self.station.mode

        pv_meters = self.station.meter_set.filter(type=0)
        company_meters = self.station.meter_set.filter(type=1)
        type = self.type
        power = get_power(pv_meters, start_date, end_date)
        if type == 0:
            reverse_power = get_power(
                company_meters, start_date, end_date, direction='reverse')
            power['total'] -= reverse_power['total']
            power['sharp'] -= reverse_power['sharp']
            power['peak'] -= reverse_power['peak']
            power['flat'] -= reverse_power['flat']
            power['valley'] -= reverse_power['valley']
        elif type == 1:
            power = get_power(
                company_meters, start_date, end_date, direction='reverse')

        if self.mode == 1:
            bill_dict['power'] = '尖 %s \n 峰 %s \n 平 %s \n 谷 %s' % \
                (decimal2string(power['sharp']),
                 decimal2string(power['peak']),
                 decimal2string(power['flat']),
                 decimal2string(power['valley']))
            bill_dict['price'] = '尖 %s \n 峰 %s \n 平 %s \n 谷 %s' % \
                (bill_dict['sharp_price'], bill_dict['peak_price'],
                 bill_dict['flat_price'], bill_dict['valley_price'])
            bill = power['sharp'] * self.sharp_price + \
                power['peak'] * self.peak_price + \
                power['flat'] * self.flat_price + \
                power['valley'] * self.valley_price
        else:
            bill_dict['power'] = decimal2string(power['total'])
            bill_dict['price'] = bill_dict['single_price']
            bill = power['total'] * self.single_price

        tax = bill * settings.TAX_RATE
        bill_dict['amount'] = decimal2string(bill - tax)
        bill_dict['tax'] = decimal2string(tax)
        bill_dict['bill'] = decimal2string(bill)

        return bill_dict

    def __str__(self):
        return '%s-%s' % (self.station.name, self.get_type_display())


class Meter(BaseModel, PrintableModel):
    name = models.CharField(max_length=512)
    number = models.CharField(max_length=512, null=True, blank=True)
    station = models.ForeignKey(
        'station.Station',
        on_delete=models.CASCADE
    )
    type = models.IntegerField(
        choices=(
            (0, '光伏并网表'),
            (1, '用户关口表'),
        ))
    direction = models.IntegerField(
        choices=(
            (0, '正向'),
            (1, '反向'),
        ),
        default=0
    )
    ct = models.IntegerField(default=1)
    pt = models.IntegerField(default=1)

    def __str__(self):
        return '%s-%s' % (self.station.name, self.name)


class Electricity(BaseModel, PrintableModel):
    meter = models.ForeignKey(
        'station.Meter',
        on_delete=models.CASCADE
    )
    date = models.DateField()
    forward_total = models.DecimalField(
        max_digits=16,
        decimal_places=4
    )
    forward_sharp = models.DecimalField(
        max_digits=16,
        decimal_places=4
    )
    forward_peak = models.DecimalField(
        max_digits=16,
        decimal_places=4
    )
    forward_flat = models.DecimalField(
        max_digits=16,
        decimal_places=4
    )
    forward_valley = models.DecimalField(
        max_digits=16,
        decimal_places=4
    )
    reverse_total = models.DecimalField(
        max_digits=16,
        decimal_places=4
    )
    reverse_sharp = models.DecimalField(
        max_digits=16,
        decimal_places=4
    )
    reverse_peak = models.DecimalField(
        max_digits=16,
        decimal_places=4
    )
    reverse_flat = models.DecimalField(
        max_digits=16,
        decimal_places=4
    )
    reverse_valley = models.DecimalField(
        max_digits=16,
        decimal_places=4
    )

    def __str__(self):
        return '%s-%s-%s' % \
            (self.meter.station.name, self.meter.name, self.date)
