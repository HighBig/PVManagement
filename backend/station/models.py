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
    is_self_consume = models.IntegerField(
        choices=(
            (0, '否'),
            (1, '是'),
        ),
        default=0
    )
    is_self_consume_discount = models.IntegerField(
        choices=(
            (0, '否'),
            (1, '是'),
        ),
        default=0
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
    discount = models.DecimalField(
        blank=True,
        null=True,
        max_digits=16,
        decimal_places=4
    )
    direct_purchase_percent = models.DecimalField(
        blank=True,
        null=True,
        max_digits=16,
        decimal_places=4
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
    direct_purchase_sharp_price = models.DecimalField(
        blank=True,
        null=True,
        max_digits=16,
        decimal_places=4
    )
    direct_purchase_peak_price = models.DecimalField(
        blank=True,
        null=True,
        max_digits=16,
        decimal_places=4
    )
    direct_purchase_flat_price = models.DecimalField(
        blank=True,
        null=True,
        max_digits=16,
        decimal_places=4
    )
    direct_purchase_valley_price = models.DecimalField(
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
        consume_power = {
            'total': 0,
            'sharp': 0,
            'peak': 0,
            'flat': 0,
            'valley': 0
        }
        if type == 0:  # 企业电量 = 光伏表正向 - 用户表反向
            reverse_power = get_power(
                company_meters, start_date, end_date, direction='reverse')
            power['total'] -= reverse_power['total']
            power['sharp'] -= reverse_power['sharp']
            power['peak'] -= reverse_power['peak']
            power['flat'] -= reverse_power['flat']
            power['valley'] -= reverse_power['valley']
            if station.is_self_consume:
                consume_power = get_power(
                    pv_meters, start_date, end_date, direction='reverse')
        elif type == 1:  # 上网电量 = 用户表反向
            power = get_power(
                company_meters, start_date, end_date, direction='reverse')

        discount = self.discount if self.discount else 1
        consume_discount = discount if station.is_self_consume else 1
        if self.mode == 1:  # 分时电价
            sharp = power['sharp']
            peak = power['peak']
            flat = power['flat']
            valley = power['valley']
            sharp_price = self.sharp_price if self.sharp_price else 0
            peak_price = self.peak_price if self.peak_price else 0
            flat_price = self.flat_price if self.flat_price else 0
            valley_price = self.valley_price if self.valley_price else 0
            direct_purchase_percent = self.direct_purchase_percent
            if direct_purchase_percent:
                dp_sharp_price = self.direct_purchase_sharp_price\
                    if self.direct_purchase_sharp_price else 0
                dp_peak_price = self.direct_purchase_peak_price\
                    if self.direct_purchase_peak_price else 0
                dp_flat_price = self.direct_purchase_flat_price\
                    if self.direct_purchase_flat_price else 0
                dp_valley_price = self.direct_purchase_valley_price\
                    if self.direct_purchase_valley_price else 0
                bill = (sharp * direct_purchase_percent * dp_sharp_price +
                        peak * direct_purchase_percent * dp_peak_price +
                        flat * direct_purchase_percent * dp_flat_price +
                        valley * direct_purchase_percent * dp_valley_price +
                        sharp * (1 - direct_purchase_percent) * sharp_price +
                        peak * (1 - direct_purchase_percent) * peak_price +
                        flat * (1 - direct_purchase_percent) * flat_price +
                        valley * (1 - direct_purchase_percent) * valley_price)\
                    * discount
            else:
                bill = (sharp * sharp_price +
                        peak * peak_price +
                        flat * flat_price +
                        valley * valley_price) * discount
            bill = bill - \
                (consume_power['sharp'] * sharp_price +
                 consume_power['peak'] * peak_price +
                 consume_power['flat'] * flat_price +
                 consume_power['valley'] * valley_price) * consume_discount
            bill_dict['price'] = decimal2string(bill / power['total'])
        else:
            price = self.single_price * discount
            bill_dict['price'] = decimal2string(price)
            bill = power['total'] * price - \
                consume_power['total'] * self.single_price * consume_discount

        bill_dict['power'] = decimal2string(
            power['total'] - consume_power['total'])
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
        blank=True,
        null=True,
        max_digits=16,
        decimal_places=4
    )
    forward_peak = models.DecimalField(
        blank=True,
        null=True,
        max_digits=16,
        decimal_places=4
    )
    forward_flat = models.DecimalField(
        blank=True,
        null=True,
        max_digits=16,
        decimal_places=4
    )
    forward_valley = models.DecimalField(
        blank=True,
        null=True,
        max_digits=16,
        decimal_places=4
    )
    reverse_total = models.DecimalField(
        max_digits=16,
        decimal_places=4
    )
    reverse_sharp = models.DecimalField(
        blank=True,
        null=True,
        max_digits=16,
        decimal_places=4
    )
    reverse_peak = models.DecimalField(
        blank=True,
        null=True,
        max_digits=16,
        decimal_places=4
    )
    reverse_flat = models.DecimalField(
        blank=True,
        null=True,
        max_digits=16,
        decimal_places=4
    )
    reverse_valley = models.DecimalField(
        blank=True,
        null=True,
        max_digits=16,
        decimal_places=4
    )

    def __str__(self):
        return '%s-%s-%s' % \
            (self.meter.station.name, self.meter.name, self.date)
