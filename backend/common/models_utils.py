def decimal2string(decimal):
    formated_str = decimal
    if hasattr(decimal, "normalize"):
        formated_str = '{0:f}'.format(decimal.normalize())

    return formated_str
