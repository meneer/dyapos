from django.db import models
from django.contrib.auth.models import User
from main.models.presentation import Presentation

class Comment(models.Model):
    # Attributes:
    user = models.ForeignKey(User)
    presentation = models.ForeignKey(Presentation)
    comment = models.CharField(max_length=500)
    published_date = models.DateTimeField(auto_now=True)
    
    class Meta:
        app_label = "main"    

    # Methods:
    def get_from_presentation(self, presentation_id):
        comments = Comment.objects.filter(presentation_id=presentation_id)
        return comments
