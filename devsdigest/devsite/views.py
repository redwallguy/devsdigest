from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie
from django.conf import settings as django_settings
import os, re, math
import logging

logger = logging.getLogger('devsdigest')


@ensure_csrf_cookie
def home(request):
    return render(request, "devsite/base.html")


def view_2048(request):
    re_list = []
    for i in range(1, 12):
        re_list.append([re.compile("meme" + str(int(math.pow(2, i))) + r'\.(png|gif|jpg|jpeg)'), i])
        logger.debug("%s is the regex", re_list[i-1][0])

    if request.method == "GET":
        context_dict = {"meme_images": []}
        with os.scandir(os.path.join(django_settings.STATIC_ROOT, 'devsite/img/2048/Memes')) as scan:
            for f in scan:
                for regex in re_list:
                    if regex[0].findall(f.name):
                        logger.debug("%s %s", f.name, regex[0])
                        url = 'devsite/img/2048/Memes/'+f.name
                        context_dict['meme_images'].append({"img": url, "num": int(math.pow(2, regex[1]))})
                        context_dict['meme_images'] = sorted(context_dict['meme_images'], key=lambda x: (x['num']))
        return render(request, context=context_dict, template_name='devsite/projects/2048.html')
