# encoding: utf-8

from django.http import HttpResponseRedirect

def change_language(request, lang):
    if lang == "en":
        request.session['django_language'] = "en"
    elif lang == "es":
        request.session['django_language'] = "es"
    elif lang == "pt":
        request.session['django_language'] = "pt"
    elif lang == "fr":
        request.session['django_language'] = "fr"
    elif lang == "it":
        request.session['django_language'] = "it"
    elif lang == "de":
        request.session['django_language'] = "de"
    
    return HttpResponseRedirect(request.META["HTTP_REFERER"])