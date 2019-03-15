from django.urls import path, re_path
from . import views
from django.views.generic.base import RedirectView

urlpatterns = [
    # redirects calls to static files made by requirejs to the proper urls
    re_path('static/(?P<static_path>.*)', views.static_redirect, name="static"),
    path('favicon.ico', RedirectView.as_view(url='/static/devsite/img/devsdigest.ico')),
    path('', views.home, name="home"),
    path('2048', views.view_2048, name='view_2048'),
    path('2048/<style_2048>', views.view_2048, name="view_2048_style"),
]
