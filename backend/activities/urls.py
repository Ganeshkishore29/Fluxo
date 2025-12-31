from django.urls import path
from .views import ActivityCreateAPIView
urlpatterns = [ 
path('activity/create/', ActivityCreateAPIView.as_view(), name='activities')
]