from django.db import models
from common.models import BaseModel, PrintableModel


class Company(BaseModel, PrintableModel):
    name = models.CharField(max_length=512)
    short_name = models.CharField(max_length=256)

    def __str__(self):
        return self.name


class Station(BaseModel, PrintableModel):
    name = models.CharField(max_length=512)
    short_name = models.CharField(max_length=256)
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
        max_digits=16,
        decimal_places=4
    )
    sharp_price = models.DecimalField(
        blank=True,
        max_digits=16,
        decimal_places=4
    )
    peak_price = models.DecimalField(
        blank=True,
        max_digits=16,
        decimal_places=4
    )
    flat_price = models.DecimalField(
        blank=True,
        max_digits=16,
        decimal_places=4
    )
    valley_price = models.DecimalField(
        blank=True,
        max_digits=16,
        decimal_places=4
    )

    def __str__(self):
        return '%s-%s' % (self.station.name, self.get_type_display())


class Meter(BaseModel, PrintableModel):
    name = models.CharField(max_length=512)
    station = models.ForeignKey(
        'station.Station',
        on_delete=models.CASCADE
    )
    type = models.IntegerField(
        choices=(
            (0, '光伏并网表'),
            (1, '用户关口表'),
        ))
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
        return '%s-%s-%s' %\
            (self.meter.station.name, self.meter.name, self.date)
