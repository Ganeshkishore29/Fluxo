from django.urls import path
from .views import ActivityCreateAPIView
urlpatterns = [ 
path('activities/', ActivityCreateAPIView.as_view(), name='activities')
]