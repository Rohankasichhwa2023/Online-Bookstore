from django.db import models
from users.models import User 

class AdminActivity(models.Model):
    admin = models.ForeignKey(User, on_delete=models.CASCADE)
    activity_desc = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

