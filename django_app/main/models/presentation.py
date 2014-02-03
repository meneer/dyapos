from django.db import models
from main.models.theme import Theme


class Presentation(models.Model):
	# Attributes:
	theme = models.ForeignKey(Theme)
	name = models.CharField(max_length=100)
	description = models.CharField(max_length=500, null=True)
	created_date = models.DateTimeField(auto_now=True)
	status = models.BooleanField()
	last_saved_date = models.DateTimeField(null=True)
	key = models.CharField(max_length=30)
	is_private = models.BooleanField()
	shared_key = models.CharField(max_length=100, null=True)
	edit_key_date = models.DateField(null=True)
	num_views = models.IntegerField()
	num_likes = models.IntegerField()
	
	class Meta:
		app_label = "main"
	
	# Methods: