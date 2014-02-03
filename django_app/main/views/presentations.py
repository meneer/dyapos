# encoding: utf-8

from main.forms.presentation import *
from main.forms.comment import *
from main.models.presentation import Presentation
from main.models.userpresentation import UserPresentation
from django.shortcuts import render_to_response
from django.http import HttpResponse, HttpResponseRedirect
from django.core.exceptions import ObjectDoesNotExist
from django.template import RequestContext
from django.utils.translation import ugettext as _
# from django.utils import simplejson
import json
from django.contrib.auth.decorators import login_required
from django.http.response import HttpResponseNotFound
from django.contrib.auth.models import User
from json import dumps
from django.core.urlresolvers import reverse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
import datetime
import hashlib
import urllib
import re
from django.forms.formsets import formset_factory
from django.http import Http404
import shutil
import os
import pymongo
from bson.objectid import ObjectId

def presentation(request, key):	
	"""Show the presentation page with info, mini preview, comments and other options """		

	# search the presentation based on its key
	p = Presentation.objects.filter(key=key).first()

	# if presentation exists
	if p is not None:
		if p.is_private:
			uspr = UserPresentation()
			if not uspr.is_allowed(request.user.id, p.id):
				raise Http404
				
		rename_form = RenameForm({"name":p.name})
		modify_description_form = ModifyDescriptionForm({"description":p.description})

		# Load comments from presentation's ID
		from main.models import Comment
		c = Comment()
		comments = c.get_from_presentation(p.id)
		
		# generate comment form
		comment_form = CommentForm()
		
		# generate share form
 		uspr = UserPresentation()		
 		share_formset = uspr.load_share_form(p.id, request.user.id)
		
		# set permissions
		is_owner = False
		can_edit = False
		
		# check if the user is logged
		if request.user.username:
			# check if the user is the owner of the presentation
			if UserPresentation.objects.filter(user_id=request.user.id, presentation_id=p.id, is_owner=True).exists():
				is_owner = True
			# check if the user can edit the presentation
			if UserPresentation.objects.filter(user_id=request.user.id, presentation_id=p.id, can_edit=True).exists():
				can_edit = True

		# show the presentation page
		return render_to_response("presentation.html", {
			"presentation": p,
			"rename_form": rename_form,
			"modify_description_form": modify_description_form,
			"share_formset": share_formset,
			"comment_form": comment_form,
			"comments": comments,
			"view_url": request.get_host() + reverse("main.views.presentations.view", args=[key]),
			"is_owner": is_owner,
			"can_edit": can_edit,
			}, context_instance=RequestContext(request))
	else:
		# show error 404 page
		raise Http404


@login_required(login_url="/")
def create(request):
	"""Create a new presentation"""

	# if data are received from the view
	if request.method == "POST":
		# get data from the form
		form = NewPresentationForm(request.POST)
		if form.is_valid():
			name = form.cleaned_data["name"]
			description = form.cleaned_data["description"]

			# set default theme (id=1)
			theme_id = 1
			
			# set the number of views and likes to 0
			num_views = num_likes = 0
		
			# set status=1 (active)
			status = 1
		
			# set the presentation key based on a random SHA1 string
			key = hashlib.sha1(str(datetime.datetime.now())).hexdigest()[:10]

			# set public=1 (public is default)
			is_private = form.cleaned_data["is_private"]
		
			# create a Presentation object with its parameters
			presentation = Presentation(theme_id=theme_id,
										name=name,
										description=description,
										status=status,
										key=key,
										is_private=is_private,
										num_views=num_views,
										num_likes=num_likes
										)
		
			# save the presentation to the database
			presentation.save()
		
			# create a UserPresentation object to associate the user with the created presentation ID
			userpresentation = UserPresentation(user_id=request.user.id,
												presentation_id=presentation.id,
												is_owner=1,
												can_edit=1,
												)
		
			# save the association to the database
			userpresentation.save()
		
			# redirect to the edit page of the created presentation
			return HttpResponseRedirect("/edit/" + str(presentation.key))

	form = NewPresentationForm()
	# redirect to home page
	return render_to_response("home.html", {"form":form}, context_instance=RequestContext(request))


@login_required(login_url="/")
def delete(request, id):
	"""Delete a presentation"""

	uspr = UserPresentation.objects.filter(presentation_id=id, user_id=request.user.id).first()

	if uspr is not None:
		thumbnail = settings.MEDIA_THUMBNAILS_ROOT + "/img_" + uspr.presentation.key + ".png"		
			
		# check if the user is the owner of the presentation
 		if uspr.is_owner:
 			uspr.presentation.delete()
 		else:
 			uspr.delete()

		# Load slides from MongoDB
		conn = pymongo.Connection(settings.MONGODB_URI)
		db = conn[settings.MONGODB_DATABASE]
		db.slides.remove({"presentation_id": id})
		db.components.remove({"presentation_id": id})
		
		# delete the presentation thumbnail
		try:
			os.remove(thumbnail)
		except:
			pass

	# redirect to home page
	return HttpResponseRedirect("/home")


@login_required(login_url="/")
def copy(request, id):
	"""Copy a backup of the presentation"""

	# search the presentation data based on its ID
	p = Presentation.objects.get(pk=id)	
	thumbnail_src = settings.MEDIA_THUMBNAILS_ROOT + "/img_" + p.key + ".png"
	
	'''delete its PK, so next time the save() method is executed, 
	it'll save a new row to the database with a new ID'''  
	p.pk = None

	# generate a presentation key, based on a random SHA1 string
	p.key = hashlib.sha1(str(datetime.datetime.now())).hexdigest()[:10]

	# generate a new name to the presentation
	p.name = _("text_copy_of") + " " + p.name
	
	# set the number of views and likes to 0
	p.num_views = p.num_likes = 0		

	# save the new copied presentation to the database
	p.save()
	
	# Copy slides from MongoDB database
	conn = pymongo.Connection(settings.MONGODB_URI)
	db = conn[settings.MONGODB_DATABASE]
	slides = db.slides.find({"presentation_id": int(id)})
	for i in slides:
		#Replace the slide _id and its presentation_id
		i["_id"] = ObjectId()
		i["presentation_id"] = p.id
		
		#Replace the components' _id
		for j in i["components"]:
			j["_id"] = str(ObjectId())
		
		#Finally save the new slide
		db.slides.insert(i)

	# associate to userpresentation table
	us_pr = UserPresentation(user_id=request.user.id,
							presentation_id=p.id,
							is_owner=1,
							can_edit=1)

	# save the association
	us_pr.save()
	
	# copy the thumbnail
# 	thumbnail_dst = settings.MEDIA_THUMBNAILS_ROOT + "/img_" + p.key + ".png"
# 	shutil.copy(thumbnail_src, thumbnail_dst)
	

	# redirect to home page
	return HttpResponseRedirect("/home")

@login_required(login_url="/")
@csrf_exempt
def rename(request):  # Ajax
	"""Rename the presentation"""

	if request.method == "POST":
		form = RenameForm(request.POST)
		if form.is_valid():
			# get the data from the form
			name = form.cleaned_data["name"]
			key = request.POST["key"]

			# search the presentation based on its key
			p = Presentation.objects.get(key=key)

			# set the new name
			p.name = name

			# update the presentation with the new name
			p.save()
			return HttpResponse("true")

		return HttpResponse("false")

@login_required(login_url="/")
@csrf_exempt
def modify_description(request):  # Ajax
	"""Modify the presentation description"""

	if request.method == "POST":
		form = ModifyDescriptionForm(request.POST)
		if form.is_valid():
			# get the data from the form
			description = form.cleaned_data["description"]
			key = request.POST["key"]

			# search the presentation based on its key
			p = Presentation.objects.get(key=key)

			# set the new description
			p.description = description

			# save the presentation with its new description
			p.save()
			return HttpResponse("true")

		return HttpResponse("false")


def edit(request, key=None):    
	"""Open the presentation editor screen"""
	
	template_data = {}
	
	if not key:
		template_data["is_anonymous"] = True
	else:
		try:		
			p = Presentation.objects.get(key=key)
			
			# check if user is allowed to edit this presentation
			if UserPresentation.objects.filter(user_id=request.user.id, presentation_id=p.id, can_edit=1).exists():	
				# get user data
				user_data = {
					"username": request.user.username,
					"first_name": request.user.first_name,
				"last_name": request.user.last_name,
				}
				
				# generate share form
		 		uspr = UserPresentation()		
		 		share_formset = uspr.load_share_form(p.id, request.user.id)
		 		
		 		template_data["presentation"] = p
		 		template_data["is_anonymous"] = False
		 		template_data["user_data"] = user_data
		 		template_data["share_formset"] = share_formset
		 		template_data["NODEJS_URL"] = settings.NODEJS_URL
		
		
			else:
				raise ObjectDoesNotExist			
		except ObjectDoesNotExist:			
			return HttpResponseRedirect("/")
	# show the editor page
	return render_to_response("edit.html", template_data, context_instance=RequestContext(request))

def download(request):
	return HttpResponse("<h2>Not implented yet. Coming soon :)</h2>")

@login_required(login_url="/")
@csrf_exempt
def update_thumbnail(request):
    """Update the presentation image (it will be executed when the user
    modifies the first slide on the presentation editor)"""
    
    # get the data from POST
    presentation_id = request.POST["presentation_id"]
    image = request.POST["image"]
    
    # get the presentation data based on the ID
    p = Presentation.objects.get(id=presentation_id)
    
    # generate an image file
    datauri = image    
    imgstr = re.search(r'base64,(.*)', datauri).group(1)
    path = settings.MEDIA_THUMBNAILS_ROOT + "/img_" + p.key + ".png"
    output = open(path, "wb")    
    output.write(imgstr.decode('base64'))    
    output.close()    
        
    return HttpResponse("")

@login_required(login_url="/")
@csrf_exempt  # no csrfmiddlewaretoken required
def upload_image(request):
    for key, file in request.FILES.items():
        filename = hashlib.sha1(str(datetime.datetime.now())).hexdigest()[:10] + file.name
        path = settings.MEDIA_IMAGES_ROOT + "/" + filename
        dest = open(path, 'w')
        if file.multiple_chunks:
            for c in file.chunks():
                dest.write(c)
        else:
            dest.write(file.read())
        dest.close()
    return HttpResponse(filename)

@login_required(login_url="/")
@csrf_exempt  # no csrfmiddlewaretoken required
def upload_image_from_url(request):
	url = request.POST["image_url"]
	img = urllib.urlretrieve(url)
	type = img[1].type
	filename = hashlib.sha1(str(datetime.datetime.now())).hexdigest()[:10] + "." + type.split("/")[1]
	if type == "image/jpeg" or type == "image/png" or type == "image/gif":
		shutil.move(img[0], settings.MEDIA_IMAGES_ROOT + "/" + filename)
	 	return HttpResponse(filename)
	else:
		return HttpResponse("false")

def view(request, key):
	"""Show the presentation"""
	
	# get the presentation data based on its key
	p = Presentation.objects.get(key=key)    
	
	if p.is_private:
		uspr = UserPresentation()
		if not uspr.is_allowed(request.user.id, p.id):
			raise Http404

	# Load slides from MongoDB
	conn = pymongo.Connection(settings.MONGODB_URI)
	db = conn[settings.MONGODB_DATABASE]
	slides = db.slides.find({"presentation_id": p.id})	
	            
	# show the presentation preview                
	return render_to_response("view.html", {
	    "presentation":p,
	    "slides":slides,
	    }, context_instance=RequestContext(request))

@login_required(login_url="/")
@csrf_exempt
def filter_all(request):  # Ajax JSON
    """Get all the presentations associated with the user.
    It includes 'own' and 'shared' presentations"""
    
    userpresentations = UserPresentation.objects.filter(user_id=request.user.id)
    
    # generate a structures object list with the presentations
    list = {"presentations":[]}
    for uspr in userpresentations:
        list["presentations"].append({
                    "id":uspr.presentation.id,
                    "key":uspr.presentation.key,
                    "name":uspr.presentation.name,
                    "img_url":settings.MEDIA_URL + "thumbnails/img_" + str(uspr.presentation.key) + ".png" })
    
    # convert object list to JSON string
    json_data = dumps(list)
    
    # print the JSON string
    return HttpResponse(json_data)


@login_required(login_url="/")
@csrf_exempt
def filter_own(request):  # Ajax JSON
    """Get all the presentations owned by the user"""    
    
    userpresentations = UserPresentation.objects.filter(user_id=request.user.id, is_owner=1)
    
    # generate a structures object list with the presentations
    list = {"presentations":[]}
    for uspr in userpresentations:
        list["presentations"].append({
                    "id":uspr.presentation.id,
                    "key":uspr.presentation.key,
                    "name":uspr.presentation.name,
					"img_url":settings.MEDIA_URL + "thumbnails/img_" + str(uspr.presentation.key) + ".png" })                    
    
    # convert object list to JSON string
    json_data = dumps(list) 
    
    # print the JSON string   
    return HttpResponse(json_data)


@login_required(login_url="/")
@csrf_exempt
def filter_shared(request):  # Ajax JSON
    """Get all the presentations that are shared to the user"""
    
    userpresentations = UserPresentation.objects.filter(user_id=request.user.id, is_owner=0)
    
    # generate a structures object list with the presentations
    list = {"presentations":[]}
    for uspr in userpresentations:
        list["presentations"].append({
                    "id":uspr.presentation.id,
                    "key":uspr.presentation.key,
                    "name":uspr.presentation.name,
					"img_url":settings.MEDIA_URL + "thumbnails/img_" + str(uspr.presentation.key) + ".png" })                      
    
    # convert object list to JSON string
    json_data = dumps(list)   
    
    # print the JSON string 
    return HttpResponse(json_data)

@login_required(login_url="/")
def share(request):
	"""Share the presentation to other users"""

	if request.method == "POST":

		presentation_id = request.POST["presentation_id"]

		formset = formset_factory(SharePresentationForm)
		formset = formset(request.POST)
		
		if formset.is_valid():
			# get the data from the form
			for form in formset:
				email = form.cleaned_data["email"]
				permission = int(form.cleaned_data["permission"])
				
				# get user info based on the email
				user = User.objects.filter(email=email).first()
				if user is not None:
					# create a UserPresentation object that associates a user to a presentation
					uspr = UserPresentation(user_id=user.id,
											presentation_id=presentation_id,
											is_owner=0,
											can_edit=permission
											)

					# save the association to the database
					uspr.save()

		# redirect to the same page
		return HttpResponseRedirect(request.META["HTTP_REFERER"])

@csrf_exempt
def search_global(request):
    """Search for presentations"""
    text = request.POST["search_text"]

    presentations = Presentation.objects.filter(name__contains=text, is_private=False)
	                          
    # generate a structures object list with the presentations
    list = {"presentations":[]}
    for p in presentations:
        list["presentations"].append({
                    "key":p.key,
                    "name":p.name,
					"img_url":settings.MEDIA_URL + "thumbnails/img_" + str(p.key) + ".png" })                    

    # convert object list to JSON string
    list = dumps(list)   

    # print the JSON string
    return HttpResponse(list)

@login_required(login_url="/")    
@csrf_exempt
def search(request):
    """Search for presentations"""
    text = request.POST["search_text"]
    selected_filter = request.POST["selected_filter"]
    
    if selected_filter == "all":
        # search all
        userpresentations = UserPresentation.objects.filter(user_id=request.user.id, presentation__name__contains=text)
    if selected_filter == "own":
        # search only own presentations
        userpresentations = UserPresentation.objects.filter(user_id=request.user.id, presentation__name__contains=text, is_owner=1)
    if selected_filter == "shared":
        # search only shared presentation
        userpresentations = UserPresentation.objects.filter(user_id=request.user.id, presentation__name__contains=text, is_owner=0)                      
    
    # generate a structures object list with the presentations
    list = {"presentations":[]}
    for uspr in userpresentations:
        list["presentations"].append({
                    "id":uspr.presentation.id,
                    "key":uspr.presentation.key,
                    "name":uspr.presentation.name,
                    "img_url":settings.MEDIA_URL + "thumbnails/img_" + str(uspr.presentation.key) + ".png" })

    # convert object list to JSON string
    list = dumps(list)   

    # print the JSON string
    return HttpResponse(list)

@csrf_exempt
def load_featured(request):
    """Search for presentations"""

    presentations = Presentation.objects.filter(is_private=False)
	                          
    # generate a structures object list with the presentations
    list = {"presentations":[]}
    for p in presentations:
        list["presentations"].append({
                    "key":p.key,
                    "name":p.name,
                    "img_url":settings.MEDIA_URL + "thumbnails/img_" + str(p.key) + ".png" })

    # convert object list to JSON string
    list = dumps(list)   

    # print the JSON string
    return HttpResponse(list) 

@login_required(login_url="/")
def like(request, id):
	p = Presentation.objects.get(pk=id)
	p.num_likes += 1
	p.save()
	return HttpResponseRedirect(request.META["HTTP_REFERER"])
