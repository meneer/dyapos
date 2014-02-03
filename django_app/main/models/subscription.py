from django.db import models
from main.models.plan import Plan
from django.contrib.auth.models import User

class Subscription(models.Model):
	# Attributes:
	user = models.ForeignKey(User)
	plan = models.ForeignKey(Plan)
	start_date = models.DateTimeField()
	end_date = models.DateTimeField()
	monthly = models.BooleanField()
	annually = models.BooleanField()
	credit_card_number = models.IntegerField()
	card_holder_name = models.CharField(max_length=60)

	class Meta:
		app_label = "main"

	# Methods:
