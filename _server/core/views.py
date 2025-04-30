from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, F, Q
from django.utils import timezone
from datetime import datetime, timedelta
from .models import ActivityType, Activity, TimeLog
from .serializers import (
    ActivityTypeSerializer, 
    ActivitySerializer, 
    TimeLogSerializer,
    DashboardTimeLogSerializer
)
from django.shortcuts import render
from django.conf  import settings
import json
import os
from django.contrib.auth.decorators import login_required
from rest_framework import viewsets, permissions, status

# Load manifest when server launches
MANIFEST = {}
if not settings.DEBUG:
    f = open(f"{settings.BASE_DIR}/core/static/manifest.json")
    MANIFEST = json.load(f)

# Create your views here.
@login_required
def index(req):
    context = {
        "asset_url": os.environ.get("ASSET_URL", ""),
        "debug": settings.DEBUG,
        "manifest": MANIFEST,
        "js_file": "" if settings.DEBUG else MANIFEST["src/main.ts"]["file"],
        "css_file": "" if settings.DEBUG else MANIFEST["src/main.ts"]["css"][0]
    }
    return render(req, "core/index.html", context)


class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to access it.
    """
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user

class ActivityTypeViewSet(viewsets.ModelViewSet):
    serializer_class = ActivityTypeSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    
    def get_queryset(self):
        return ActivityType.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
    @action(detail=True, methods=['get'])
    def activities(self, request, pk=None):
        """Get activities for a specific activity type"""
        activity_type = self.get_object()
        activities = Activity.objects.filter(activity_type=activity_type)
        serializer = ActivitySerializer(activities, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def create_defaults(self, request):
        """Create default activity types for new users"""
        # Check if user already has activity types
        if ActivityType.objects.filter(user=request.user).exists():
            return Response({"detail": "Default activity types already exist"}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Create default activity types
        defaults = [
            {"name": "Productive", "description": "Work, study, and other productive activities", "color": "#27ae60", "is_default": True},
            {"name": "Unproductive", "description": "Leisure, entertainment, and other non-productive activities", "color": "#e74c3c", "is_default": True},
            {"name": "Sleep", "description": "Time spent sleeping", "color": "#8e44ad", "is_default": True}
        ]
        
        for default in defaults:
            ActivityType.objects.create(user=request.user, **default)
            
        return Response({"detail": "Default activity types created"}, 
                       status=status.HTTP_201_CREATED)

class ActivityViewSet(viewsets.ModelViewSet):
    serializer_class = ActivitySerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    
    def get_queryset(self):
        return Activity.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
    def list(self, request):
        # Option to filter by activity type
        activity_type_id = request.query_params.get('activity_type')
        queryset = self.get_queryset()
        
        if activity_type_id:
            queryset = queryset.filter(activity_type_id=activity_type_id)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class TimeLogViewSet(viewsets.ModelViewSet):
    serializer_class = TimeLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    
    def get_queryset(self):
        return TimeLog.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
    def list(self, request):
        # Support filtering by date range, activity type, and activity
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        activity_type_id = request.query_params.get('activity_type')
        activity_id = request.query_params.get('activity')
        
        queryset = self.get_queryset()
        
        if start_date:
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d')
                queryset = queryset.filter(start_time__gte=start_date)
            except ValueError:
                pass
                
        if end_date:
            try:
                end_date = datetime.strptime(end_date, '%Y-%m-%d')
                end_date = end_date.replace(hour=23, minute=59, second=59)
                queryset = queryset.filter(end_time__lte=end_date)
            except ValueError:
                pass
                
        if activity_type_id:
            queryset = queryset.filter(activity_type_id=activity_type_id)
            
        if activity_id:
            queryset = queryset.filter(activity_id=activity_id)
            
        queryset = queryset.order_by('-start_time')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
        
    @action(detail=False, methods=['get'])
    def dashboard_data(self, request):
        """Get data for dashboard visualizations"""
        # Default to last 7 days if no date range provided
        days = int(request.query_params.get('days', 7))
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        # Get time logs for date range
        time_logs = TimeLog.objects.filter(
            user=request.user,
            start_time__gte=start_date,
            end_time__lte=end_date
        )
        
        # Daily breakdown by activity type
        daily_data = []
        current_date = start_date.date()
        end_date_only = end_date.date()
        
        while current_date <= end_date_only:
            day_logs = time_logs.filter(
                start_time__date=current_date
            )
            
            # Calculate minutes for each activity type
            day_data = {
                'date': current_date.strftime('%Y-%m-%d'),
                'activities': {}
            }
            
            # Get all activity types for the user
            activity_types = ActivityType.objects.filter(user=request.user)
            
            for activity_type in activity_types:
                # Filter logs for this activity type
                type_logs = day_logs.filter(activity_type=activity_type)
                
                # Calculate total minutes
                total_minutes = 0
                for log in type_logs:
                    total_minutes += log.duration()
                    
                day_data['activities'][activity_type.name] = {
                    'minutes': total_minutes,
                    'color': activity_type.color
                }
                
            daily_data.append(day_data)
            current_date += timedelta(days=1)
            
        # Most/least logged activities
        activity_totals = []
        activities = Activity.objects.filter(user=request.user)
        
        for activity in activities:
            # Get time logs for this activity
            activity_logs = time_logs.filter(activity=activity)
            
            # Calculate total minutes
            total_minutes = 0
            for log in activity_logs:
                total_minutes += log.duration()
                
            if total_minutes > 0:
                activity_totals.append({
                    'id': activity.id,
                    'name': activity.name,
                    'activity_type': activity.activity_type.name,
                    'color': activity.activity_type.color,
                    'minutes': total_minutes
                })
        
        # Sleep consistency data
        sleep_logs = time_logs.filter(
            activity_type__name='Sleep'
        ).order_by('start_time')
        
        sleep_data = []
        for log in sleep_logs:
            sleep_data.append({
                'date': log.start_time.strftime('%Y-%m-%d'),
                'sleep_time': log.start_time.strftime('%H:%M'),
                'wake_time': log.end_time.strftime('%H:%M'),
                'duration_minutes': log.duration()
            })
        
        return Response({
            'daily_breakdown': daily_data,
            'activity_totals': activity_totals,
            'sleep_data': sleep_data
        })