from django.shortcuts import render, redirect
from django.views.decorators.csrf import ensure_csrf_cookie
from django.conf import settings as django_settings
from django.contrib.staticfiles.storage import staticfiles_storage
from django.http.response import HttpResponse
import os, re, math, boto3, json
import logging

logger = logging.getLogger('devsdigest')

#def static_redirect(request, static_path):
#    logger.debug("Redirecting to " + static_path)
#    return redirect(django_settings.STATIC_URL + static_path)

@ensure_csrf_cookie
def home(request):
    return render(request, "devsite/base.html")


def view_2048(request, style_2048=None): # TODO menu page on /2048
    context_dict = {"meme_images":[], "banner": ""}
    #style_2048 = "Memes" if style_2048 is None else style_2048 # ternary operator python

    style_2048 = "Memes" if style_2048 is None else style_2048
    for i in range(1,12):
        for f in ['png','jpg','jpeg','gif']:
            file_name = "devsite/img/2048/" + style_2048 + "/meme" + \
            str(math.floor(math.pow(2,i))) + "." + f
            logger.debug("Searching for: " + file_name)

            if staticfiles_storage.exists(file_name):
                context_dict["meme_images"].append({"num": str(math.floor(math.pow(2,i))),
                "img": file_name})
                logger.debug(file_name + " found")
                break

    logger.debug("meme_images dict: %s", context_dict["meme_images"])
    if len(context_dict["meme_images"]) == 11:
        context_dict["meme_images"] = sorted(context_dict["meme_images"], key=lambda x: int(x["num"]))
        return render(request, "devsite/projects/2048.html", context=context_dict)

    return render(request, "devsite/error/404.html")

def menu_2048(request):
    context_dict = {"styles": []}

    # https://github.com/boto/boto3/issues/134#issuecomment-116766812
    s3 = boto3.client('s3')
    paginator = s3.get_paginator('list_objects_v2')
    for res in paginator.paginate(Bucket=django_settings.AWS_STORAGE_BUCKET_NAME,Delimiter='/',Prefix='static/devsite/img/2048/'):
        for prefix in res.get('CommonPrefixes'):
            style_dict = {"name": "", "url": "", "banner": ""}
            style_dir_name = re.split('/',prefix.get('Prefix'))[4]
            style_dict["url"] = "/2048/" + style_dir_name
            logger.debug(style_dir_name)

            # get object, call read() on StreamingBody object, load into dictionary, then read "name" key
            style_dict['name'] = json.loads(s3.get_object(Bucket=django_settings.AWS_STORAGE_BUCKET_NAME,Key=prefix.get('Prefix')+"info.json")['Body'].read())["name"]
            logger.debug("Display name: " + style_dict['name'])

            for f in ['jpg','png','jpeg','gif']:
                if staticfiles_storage.exists("devsite/img/2048/" + style_dir_name + "/banner." + f):
                    style_dict['banner'] = staticfiles_storage.url("devsite/img/2048/" + style_dir_name + "/banner." + f)
                    logger.debug(style_dict['banner'])

            context_dict['styles'].append(style_dict)
    #with open(staticfiles_storage.url('staticfiles.json')) as f:
    #    logger.debug(json.loads(f))
    return render(request, "devsite/projects/menu_2048.html", context=context_dict)

def dev_menu_2048(request):
    context_dict = {"styles": []}

    with os.scandir('/Users/devmoney/DesktopDir/Programming/Python/devsdigest/devsdigest/devsite/static/devsite/img/2048') as scanner:
        for d in scanner:
            if d.is_dir():
                style_dict = {"name": "", "url": "", "banner": ""}
                style_dict["url"] = "/2048/" + d.name
                with open(os.path.join(d.path,"info.json")) as f:
                    style_dict["name"] = json.load(f)["name"]

                for file_type in ['jpg','jpeg','png','gif']:
                    if staticfiles_storage.exists("devsite/img/2048/"+d.name+"/banner."+file_type):
                        style_dict["banner"] = staticfiles_storage.url("devsite/img/2048/"+d.name+"/banner."+file_type)
                context_dict["styles"].append(style_dict)

    return render(request, "devsite/projects/menu_2048.html", context=context_dict)
