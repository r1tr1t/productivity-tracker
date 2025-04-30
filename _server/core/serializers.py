# timetracker/serializers.py
from rest_framework import serializers
from .models import ActivityType, Activity, TimeLog

class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ['id', 'name', 'activity_type', 'description']
        
    def validate(self, data):
        # Ensure activity belongs to the user
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            data['user'] = request.user
        return data

class ActivityTypeSerializer(serializers.ModelSerializer):
    activities_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ActivityType
        fields = ['id', 'name', 'description', 'color', 'is_default', 'activities_count']
    
    def get_activities_count(self, obj):
        return obj.activities.count()
        
    def validate(self, data):
        # Ensure activity type belongs to the user
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            data['user'] = request.user
        return data

class TimeLogSerializer(serializers.ModelSerializer):
    activity_name = serializers.SerializerMethodField()
    activity_type_name = serializers.SerializerMethodField()
    duration_minutes = serializers.SerializerMethodField()
    
    class Meta:
        model = TimeLog
        fields = ['id', 'activity', 'activity_type', 'activity_name', 'activity_type_name', 
                 'start_time', 'end_time', 'notes', 'duration_minutes', 'created_at', 'updated_at']
        
    def get_activity_name(self, obj):
        return obj.activity.name if obj.activity else None
        
    def get_activity_type_name(self, obj):
        return obj.activity_type.name
        
    def get_duration_minutes(self, obj):
        return obj.duration()
        
    def validate(self, data):
        # Ensure timelog belongs to the user
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            data['user'] = request.user
            
        # Validate start and end times
        if data.get('start_time') and data.get('end_time'):
            if data['start_time'] >= data['end_time']:
                raise serializers.ValidationError("Start time must be before end time")
                
        # Validate activity belongs to activity_type
        if data.get('activity') and data.get('activity_type'):
            if data['activity'].activity_type != data['activity_type']:
                raise serializers.ValidationError("Activity does not belong to selected activity type")
                
        return data

class DashboardTimeLogSerializer(serializers.ModelSerializer):
    """Simplified serializer for dashboard data"""
    activity_name = serializers.SerializerMethodField()
    activity_type_name = serializers.SerializerMethodField()
    activity_type_color = serializers.SerializerMethodField()
    duration_minutes = serializers.SerializerMethodField()
    
    class Meta:
        model = TimeLog
        fields = ['id', 'activity_name', 'activity_type_name', 'activity_type_color',
                 'start_time', 'end_time', 'duration_minutes']
        
    def get_activity_name(self, obj):
        return obj.activity.name if obj.activity else None
        
    def get_activity_type_name(self, obj):
        return obj.activity_type.name
        
    def get_activity_type_color(self, obj):
        return obj.activity_type.color
        
    def get_duration_minutes(self, obj):
        return obj.duration()