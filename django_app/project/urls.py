from django.conf.urls import patterns, include, url
from django.contrib import admin
from django.conf import settings

admin.autodiscover()

urlpatterns = patterns('',
	url(r'^admin/doc', include('django.contrib.admindocs.urls')),
	url(r'^admin', include(admin.site.urls)),
	#Users
	url(r'^signup','main.views.users.signup'),
	url(r'^login','main.views.users.user_login'),
	url(r'^logout','main.views.users.user_logout'),
	url(r'^profile', 'main.views.users.profile'),
	url(r'^change-password','main.views.users.change_password'),
	url(r'^recover-password','main.views.users.recover_password'),
	url(r'^delete-account','main.views.users.delete'),
	# Presentations
	url(r'^create', 'main.views.presentations.create'),
	url(r'^delete/(?P<id>\w+)', 'main.views.presentations.delete'),
	url(r'^copy/(?P<id>\w+)', 'main.views.presentations.copy'),
	url(r'^rename', 'main.views.presentations.rename'),
	url(r'^modify-description', 'main.views.presentations.modify_description'),
	url(r'^edit/(?P<key>\w+)', 'main.views.presentations.edit'),
	url(r'^edit$', 'main.views.presentations.edit'),
	url(r'^download', 'main.views.presentations.download'),
	url(r'^update-thumbnail', 'main.views.presentations.update_thumbnail'),
 	url(r'^image/upload$', 'main.views.presentations.upload_image'),
	url(r'^image/upload-from-url$', 'main.views.presentations.upload_image_from_url'),
	url(r'^filter-all','main.views.presentations.filter_all'),
	url(r'^filter-own','main.views.presentations.filter_own'),
	url(r'^filter-shared','main.views.presentations.filter_shared'),
	url(r'^p/(?P<key>\w+)','main.views.presentations.presentation'),
	url(r'^view/(?P<key>\w+)$', 'main.views.presentations.view'),
	url(r'^share', 'main.views.presentations.share'),
	url(r'^search$', 'main.views.presentations.search'),
	url(r'^search-global$', 'main.views.presentations.search_global'),
	url(r'^load-featured$', 'main.views.presentations.load_featured'),
	url(r'^like/(?P<id>\w+)', 'main.views.presentations.like'),
	# Pages
	url(r'^$','main.views.pages.index'),
	url(r'^index','main.views.pages.index'),
	url(r'^home','main.views.pages.home'),
	# Comments
	url(r'^comment$', 'main.views.comments.comment'),
	url(r'^comment/delete/(?P<id>\w+)', 'main.views.comments.delete'),
	# Themes
	url(r'^themes_selectlist', 'main.views.themes.selectlist'),
	url(r'^themes_select', 'main.views.themes.select'),
	url(r'^theme-preview/(?P<id>\w+)', 'main.views.themes.preview'),
	# Configs
	url(r'^lang/(?P<lang>\w+)','main.views.configs.change_language'),
	# Other
	url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {
            'document_root': settings.MEDIA_ROOT,
        }),
)
