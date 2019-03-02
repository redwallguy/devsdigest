from django.urls import path, re_path
from . import views

urlpatterns = [
    path('', views.home, name="home"),
    path('2048', views.view_2048, name="view_2048")
]
