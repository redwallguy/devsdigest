from django.shortcuts import render, redirect
from django.views.decorators.csrf import ensure_csrf_cookie
from django.conf import settings as django_settings
from django.contrib.staticfiles.templatetags.staticfiles import static
from django.contrib.staticfiles.storage import staticfiles_storage
from django.http.response import HttpResponse
import os, re, math
import logging

logger = logging.getLogger('devsdigest')

def static_redirect(request, static_path):
    logger.debug("Redirecting to " + static_path)
    return redirect(django_settings.STATIC_URL + static_path)

@ensure_csrf_cookie
def home(request):
    return render(request, "devsite/base.html")


def view_2048(request, style_2048=None): # TODO menu page on /2048
    re_list = []
    #style_2048 = "Memes" if style_2048 is None else style_2048 # ternary operator python

    for i in range(1,12):
        for f in ['png','jpg','jpeg','gif']:
            logger.debug("Searching for: " + "meme" + str(math.floor(math.pow(2,i))) +  \
            "." + f + "..." + str(staticfiles_storage.exists("devsite/img/2048/Memes/meme" + \
            str(math.floor(math.pow(2,i))) + "." + f)))
    return HttpResponse("Hello there!")
