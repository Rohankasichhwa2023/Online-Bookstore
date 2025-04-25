from django.db import models



class StoreInfo(models.Model):
    logo_url = models.TextField(blank=True, null=True)
    name = models.CharField(max_length=255)
    location = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(max_length=100, blank=True, null=True)
    established_date = models.DateField(blank=True, null=True)
    story = models.TextField(blank=True, null=True)
    instagram_url = models.TextField(blank=True, null=True)
    facebook_url = models.TextField(blank=True, null=True)
    tiktok_url = models.TextField(blank=True, null=True)
    return_policy = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class StorePhoto(models.Model):
    store = models.ForeignKey(StoreInfo, on_delete=models.CASCADE)
    photo_url = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

