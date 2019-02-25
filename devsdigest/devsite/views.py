from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie
from django.conf import settings as django_settings
import os, re
import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

@ensure_csrf_cookie
def home(request):
    return render(request, "devsite/base.html")

def view_2048(request):
    re_list = []
    for i in range(1,12):
        re_list.append([re.compile(str(i) + r'\.(png|gif|jpg|jpeg)'), i])
        logger.info("%s is the regex", re_list[i-1])

    if request.method == "GET":
        img_dict = {}
        with os.scandir(os.path.join(django_settings.STATIC_ROOT,'devsite/img/2048/')) as scan:
            for f in scan:
                for regex in re_list:
                    if regex.findall(f.name):
                        logger.info("%s %s", f.name, regex)

