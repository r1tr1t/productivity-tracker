# timetracker/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class ActivityType(models.Model):
    """Main activity categories (Productive, Unproductive, Sleep)"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    color = models.CharField(max_length=7, default="#3498db")  # Hex color for UI
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activity_types')
    is_default = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ('user', 'name')
    
    def __str__(self):
        return self.name

class Activity(models.Model):
    """Sub-activities that belong to each ActivityType"""
    name = models.CharField(max_length=100)
    activity_type = models.ForeignKey(ActivityType, on_delete=models.CASCADE, related_name='activities')
    description = models.TextField(blank=True, null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    
    class Meta:
        verbose_name_plural = "Activities"
        unique_together = ('user', 'activity_type', 'name')
    
    def __str__(self):
        return f"{self.name} ({self.activity_type.name})"

class TimeLog(models.Model):
    """Records of time spent on activities"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='time_logs')
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name='time_logs', null=True, blank=True)
    activity_type = models.ForeignKey(ActivityType, on_delete=models.CASCADE, related_name='time_logs')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        activity_name = self.activity.name if self.activity else self.activity_type.name
        return f"{activity_name}: {self.start_time} - {self.end_time}"
    
    def duration(self):
        """Return duration in minutes"""
        delta = self.end_time - self.start_time
        return delta.total_seconds() / 60
    
    def clean(self):
        """Validate that start_time is before end_time"""
        from django.core.exceptions import ValidationError
        if self.start_time and self.end_time and self.start_time >= self.end_time:
            raise ValidationError("Start time must be before end time")
        
        # Ensure activity belongs to the correct activity_type if provided
        if self.activity and self.activity.activity_type != self.activity_type:
            raise ValidationError("Activity does not belong to the selected activity type")