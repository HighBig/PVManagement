def decimal2string(decimal):
    formatted_str = decimal
    if hasattr(decimal, "normalize"):
        formatted_str = '{0:f}'.format(decimal.normalize())

    formatted_str = str(formatted_str)
    if '.' in formatted_str and len(formatted_str.split('.')[-1]) > 2:
        dot_index = formatted_str.index('.')
        formatted_str = formatted_str[:dot_index+3]

    return formatted_str
