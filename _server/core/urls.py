from django.urls import path, include
from . import views
from .views import ActivityTypeViewSet, ActivityViewSet, TimeLogViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'activity-types', ActivityTypeViewSet, basename='activity-type')
router.register(r'activites', ActivityViewSet, basename='activity')
router.register(r'time-logs', TimeLogViewSet, basename='time-log')

urlpatterns = [
    path('', view=views.index, name="index"),
    path('api/', include(router.urls))
]