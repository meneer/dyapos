# encoding: utf-8

from main.models.userpresentation import UserPresentation
from main.models.comment import Comment
from main.forms.user import *
from django.shortcuts import render_to_response
from django.http import HttpResponseRedirect, HttpResponse
from django.template import RequestContext
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.core.mail import send_mail
import datetime
import hashlib
import json
from django.forms.forms import NON_FIELD_ERRORS


def signup(request):
    """Register a new user"""
    return HttpResponse("<h2>Not available yet. Coming soon :)</h2>")

    # if data are received from the form
    if request.method == "POST":
        form = SignupForm(request.POST)
        if form.is_valid():
		    # Get data from the signup form
		    first_name = form.cleaned_data["first_name"]
		    last_name = form.cleaned_data["last_name"]
		    email = form.cleaned_data["email"]
		    password = form.cleaned_data["password"]

		    '''Generate a random username (format: username + underline + random md5 string).
		    username is not so important, because the users log in with their email address'''
		    username = email.split("@")[0] + "_" + hashlib.md5(str(datetime.datetime.now())).hexdigest()[:5]
		    newuser = User(username=username,
		            first_name=first_name,
		            last_name=last_name,
		            email=email,
		            is_superuser=0,
		            is_active=1,
		            is_staff=0,
		            )

		    # hash the password using a cryptographic algorithm
		    newuser.set_password(password)
		    newuser.save()

		    # redirect to main page
		    return HttpResponseRedirect("/")
        else:
        	return render_to_response("signup.html", { "form": form }, context_instance=RequestContext(request))
    else:
	    form = SignupForm()

    # show signup form
    return render_to_response("signup.html", { "form": form }, context_instance=RequestContext(request))


def user_login(request):
    """Login form"""

    # if already logged in
    if request.user.username:
        return HttpResponseRedirect("/")

    form = LoginForm()

    # if data are received from the form
    if request.method == "POST":
		form = LoginForm(request.POST)
		if form.is_valid():
			# get data from the form
			email = form.cleaned_data["email"]
			password = form.cleaned_data["password"]

			# authenticate user
			user = authenticate(username=email, password=password)

			# login user
			login(request, user)

			# redirect to user's home page
			return HttpResponseRedirect("/home")

    return render_to_response("login.html", {'form':form}, context_instance=RequestContext(request))

def recover_password(request):
	"""Recovery password form. it's used to send an email with
	a reset password link to the user"""

	# if data are received from the form
	if request.method == "POST":
		form = RecoverPasswordForm(request.POST)
		if form.is_valid():
			# get data from the form
			email = form.cleaned_data["email"]

			# send the email
			send_mail("Password recovery", "If you forgot your password, you can reset on the following link: ", "", [email], fail_silently=False)

			# return to main page
			return HttpResponseRedirect("/")
		else:
			return render_to_response("recover_password.html", {'form':form}, context_instance=RequestContext(request))
	else:
		form = RecoverPasswordForm()
	# show recovery password form
	return render_to_response("recover_password.html", {'form':form}, context_instance=RequestContext(request))


@login_required(login_url="/")
def user_logout(request):
    """Close user's session"""

    # logout
    logout(request)

    # redirect to main page
    return HttpResponseRedirect("/")


@login_required(login_url="/")
def profile(request):
	"""Show and update user data"""

	# if data are received from the form
	if request.method == "POST":
		# get data from the form
		form = ProfileForm(request.POST)
		if form.is_valid():
			first_name = form.cleaned_data["first_name"]
			last_name = form.cleaned_data["last_name"]
			email = form.cleaned_data["email"]

			# check if the email address is already used for another user
			if not User.objects.filter(email=email).exclude(id=request.user.id):
				# update user fields to the User object
				updated_user = User.objects.filter(username=request.user)[0]
				updated_user.first_name = first_name
				updated_user.last_name = last_name
				updated_user.email = email

				# update user data to the database
				updated_user.save()

				# redirect to home page
				return HttpResponseRedirect("/profile")
		else:
			return render_to_response("profile.html", {"form": form}, context_instance=RequestContext(request))
	else:
		# get data from the user
		user = User.objects.get(pk=request.user.id)
		form = ProfileForm({
			"id": request.user.id,
			"first_name": user.first_name,
			"last_name": user.last_name,
			"email": user.email
		})

	# show the profile page
	return render_to_response("profile.html", {"form": form}, context_instance=RequestContext(request))


@login_required(login_url="/")
def change_password(request):
	"""Change the user's password"""

	# if data are received from the form
	if request.method == "POST":
		form = ChangePasswordForm(request.POST)
		if form.is_valid():
			# get data from the form
			old_password = form.cleaned_data["old_password"]
			new_password = form.cleaned_data["new_password"]

			# Check if old password is correct
			if authenticate(username=request.user.email, password=old_password):
				user = User.objects.get(pk=request.user.id)
				# hash the new password using a cryptographic algorithm
				user.set_password(new_password)

				# update user with the new password to the database
				user.save()

				return HttpResponseRedirect("/profile")
			else:
				form.non_field_errors = "Your old password is incorrect"
				return render_to_response("change_password.html", {'form':form}, context_instance=RequestContext(request))
		else:
			return render_to_response("change_password.html", {'form':form}, context_instance=RequestContext(request))
	else:
		form = ChangePasswordForm()

	# show change password form
	return render_to_response("change_password.html", {'form':form}, context_instance=RequestContext(request))

@login_required(login_url="/")
def delete(request):
	user_id = request.user.id

	# get a list of created presentations
	userpresentations = UserPresentation.objects.filter(user_id=request.user.id, is_owner=1)
	# delete every presentation
	for uspr in userpresentations:
		uspr.presentation.delete()

	# delete user from database
	User.objects.get(pk=user_id).delete()

	# redirect to index
	return HttpResponseRedirect("/")
