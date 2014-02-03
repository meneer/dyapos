# encoding: utf-8

from django.http import HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from main.models.comment import Comment
from main.models.userpresentation import UserPresentation
from main.forms.comment import *


@login_required(login_url="/")
def comment(request):    
	"""Post a comment on a presentation"""

	if request.method == "POST":
		form = CommentForm(request.POST)
		if form.is_valid():
			presentation_id = form.cleaned_data["presentation_id"]
			comment = form.cleaned_data["comment"]
			user_id = request.user.id  #get the ID of the user that posted the comment
			c = Comment(user_id=user_id,
						presentation_id=presentation_id,
						comment=comment,
						)
			c.save()

	#Reload the same page
	return HttpResponseRedirect(request.META["HTTP_REFERER"])

# @login_required(login_url="/")
def delete(request, id):
	"""Delete a comment"""

	comment = Comment.objects.get(pk=id)
	presentation_id = comment.presentation.id
	uspr = UserPresentation.objects.filter(user_id=request.user.id, presentation_id=presentation_id, is_owner=1)
	
	# If the user is the owner of the presentation
	if uspr.exists():
		comment.delete()
 	
	#Reload the same page
 	return HttpResponseRedirect(request.META["HTTP_REFERER"])	