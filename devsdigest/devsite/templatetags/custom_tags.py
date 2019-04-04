from django import template

register = template.Library()

@register.filter
def addstr(str1,str2):
    """Concatonate given objects' string representations."""
    return str(str1) + str(str2)

@register.filter
def times(n):
    """Returns range for looping."""
    return range(1,n+1)
