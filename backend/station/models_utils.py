def get_power(meters, start_date, end_date, direction='forward'):
    total = 0
    sharp = 0
    peak = 0
    flat = 0
    valley = 0
    for meter in meters:
        start_electricity = meter.electricity_set\
                                 .filter(date=start_date)\
                                 .first()
        end_electricity = meter.electricity_set\
                               .filter(date=end_date)\
                               .first()

        if not start_electricity or not end_electricity:
            continue

        magnification = meter.ct * meter.pt
        if ((direction == 'forward' and meter.direction == 0) or
                (direction == 'reverse' and meter.direction == 1)):
            total += \
                (end_electricity.forward_total -
                 start_electricity.forward_total) * magnification
            sharp += \
                (end_electricity.forward_sharp -
                 start_electricity.forward_sharp) * magnification
            peak += \
                (end_electricity.forward_peak -
                 start_electricity.forward_peak) * magnification
            flat += \
                (end_electricity.forward_flat -
                 start_electricity.forward_flat) * magnification
            valley += \
                (end_electricity.forward_valley -
                 start_electricity.forward_valley) * magnification
        elif ((direction == 'reverse' and meter.direction == 0) or
              (direction == 'forward' and meter.direction == 1)):
            total += \
                (end_electricity.reverse_total -
                 start_electricity.reverse_total) * magnification
            sharp += \
                (end_electricity.reverse_sharp -
                 start_electricity.reverse_sharp) * magnification
            peak += \
                (end_electricity.reverse_peak -
                 start_electricity.reverse_peak) * magnification
            flat += \
                (end_electricity.reverse_flat -
                 start_electricity.reverse_flat) * magnification
            valley += \
                (end_electricity.reverse_valley -
                 start_electricity.reverse_valley) * magnification

    return {
        'total': total,
        'sharp': sharp,
        'peak': peak,
        'flat': flat,
        'valley': valley
    }
