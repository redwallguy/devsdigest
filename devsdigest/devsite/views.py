from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie
from django.conf import settings as django_settings
from django.contrib.staticfiles.templatetags.staticfiles import static
from django.shortcuts import redirect
import os, re, math
import logging

logger = logging.getLogger('devsdigest')

def static_redirect(request, static_path):
    logger.debug("Redirecting to " + static_path)
    return redirect(django_settings.STATIC_URL + static_path)

@ensure_csrf_cookie
def home(request):
    return render(request, "devsite/base.html")


def view_2048(request, style_2048):
    re_list = []
    for i in range(1, 12):
        re_list.append([re.compile("meme" + str(int(math.pow(2, i))) + r'\.(png|gif|jpg|jpeg)'), i])
        logger.debug("%s is the regex", re_list[i-1][0])

    if style_2048 is None:
        context_dict = {"meme_images": []}
        with os.scandir(os.path.join(django_settings.STATIC_ROOT, 'devsite/img/2048/Memes')) as scan:
            for f in scan:
                if f.name == "blank.gif":
                    context_dict['blank'] = 'devsite/img/2048/Memes/' + f.name
                for regex in re_list:
                    if regex[0].findall(f.name):
                        logger.debug("%s %s", f.name, regex[0])
                        url = 'devsite/img/2048/Memes/'+f.name
                        context_dict['meme_images'].append({"img": url, "num": int(math.pow(2, regex[1]))})
                        context_dict['meme_images'] = sorted(context_dict['meme_images'], key=lambda x: (x['num']))
        return render(request, context=context_dict, template_name='devsite/projects/2048.html')
