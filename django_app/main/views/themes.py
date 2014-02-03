# encoding: utf-8

from django.http.response import HttpResponse
from main.models.theme import Theme
from main.models.presentation import Presentation
from django.shortcuts import render_to_response
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from json import dumps
from django.template.context import RequestContext

@csrf_exempt
def selectlist(request):
    ''' Load a list of themes '''
    
    if request.user.is_authenticated():
        # note: it will be modified later for filtering custom themes according to the user
        themes = Theme.objects.filter(is_custom=0)
    else:
        themes = Theme.objects.filter(is_custom=0)
    
    # generate a list with themes    
    list = {"themes":[]}
    for theme in themes:
        list["themes"].append({"id": theme.id,
                     "name": theme.name,
                     })
        
    # transform the generate list into a JSON format
    json_themes = dumps(list)
    
    return HttpResponse(json_themes)

@login_required(login_url="/")  
@csrf_exempt  
def select(request):
    ''' Select a theme from the list and applies it to the presentation '''
    presentation_id = request.POST["presentation_id"]
    theme_id = request.POST["theme_id"]
    p = Presentation.objects.get(id=presentation_id)
    if p is not None:
        p.theme_id = theme_id
        p.save()
    return HttpResponse("Theme changed")

def preview(request, id):
    ''' Render a preview of the theme according to the passed ID '''
    
    theme = Theme.objects.get(pk=id)
    
    if theme:
        return render_to_response("theme-preview.html", {"theme_id": id }, context_instance=RequestContext(request))
    
    return HttpResponse(theme)