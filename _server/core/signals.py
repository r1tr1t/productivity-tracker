from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import ActivityType

@receiver(post_save, sender=User)
def create_default_activity_types(sender, instance, created, **kwargs):
    """Create default activity types for new users"""
    if created:
         defaults = [
            {"name": "Productive", "description": "Work, study, and other productive activities", "color": "#27ae60", "is_default": True},
            {"name": "Unproductive", "description": "Leisure, entertainment, and other non-productive activities", "color": "#e74c3c", "is_default": True},
            {"name": "Sleep", "description": "Time spent sleeping", "color": "#8e44ad", "is_default": True}
        ]
         
         for default in defaults:
              ActivityType.objects.create(user=instance, **default)