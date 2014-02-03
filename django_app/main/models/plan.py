from django.db import models

class Plan(models.Model):
	# Attributes:
	name = models.CharField(max_length=60)
	price_monthly = models.FloatField()
	price_anually = models.FloatField()
	storage_size = models.IntegerField()
	private_presentations = models.BooleanField()
	support = models.BooleanField()

	class Meta:
		app_label = "main"

	# Methods:
