from django.db import models
from django.contrib.auth.models import User

class Theme(models.Model):
	# Attributes:
	name = models.CharField(max_length=45)
	css = models.TextField(null=True)
	is_custom = models.BooleanField()
	user = models.ForeignKey(User, null=True)

	class Meta:
		app_label = "main"

	# Methods:
