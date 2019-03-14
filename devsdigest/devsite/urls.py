from django.urls import path, re_path
from . import views

urlpatterns = [
    re_path('static/(?P<static_path>.*)', views.static_redirect, name="static"),
    path('', views.home, name="home"),
    path('2048', views.view_2048, name='view_2048'),
    path('2048/<style_2048>', views.view_2048, name="view_2048_style"),
]
