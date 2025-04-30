from django.urls import path, include
from . import views
from .views import ActivityTypeViewSet, ActivityViewSet, TimeLogViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'activity-types', ActivityTypeViewSet, basename='activity-type')
router.register(r'activities', ActivityViewSet, basename='activity')
router.register(r'time-logs', TimeLogViewSet, basename='time-log')

urlpatterns = [
    path('', view=views.index, name="index"),
    path('activity-types', view=views.index, name="index"),
    path('activities', view=views.index, name="index"),
    path('time-logs', view=views.index, name="index"),
    path('add-time-log', view=views.index, name="index"),
    path('edit-time-log', view=views.index, name="index"),
    path('api/', include(router.urls)),
]