from django.urls import path
from .import views

urlpatterns = [
    path('chatbot/', views.index, name='index'),
    path('add_pq/', views.add_pq, name='add_pq'),
    path('fetch_pqs/', views.fetch_pqs, name='fetch_pqs'),
    path('fetch_cat/', views.fetch_cat, name='fetch_acat'),
    path('fetch_ans/', views.fetch_ans, name='fetch_ans'),
]
