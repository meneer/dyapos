from django import forms
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.utils.translation import ugettext_lazy as _

class SignupForm(forms.Form):	
	first_name = forms.CharField(min_length=3,
								max_length=20)
	last_name = forms.CharField(min_length=3,
								max_length=20)
	email = forms.EmailField()
	password = forms.CharField(widget=forms.PasswordInput)
	password_repeat = forms.CharField(widget=forms.PasswordInput)
	
	def clean(self):
		# Check if passwords match
		password1 = self.cleaned_data.get('password')
		password2 = self.cleaned_data.get('password_repeat')
		
		if password1 != password2:
		    raise forms.ValidationError(_("error_passwords_dont_match"))
		
		# Check if email already exists
		if User.objects.filter(email=self.cleaned_data.get("email")).exists():
			raise forms.ValidationError(_("error_email_already_registered"))

		return self.cleaned_data

class LoginForm(forms.Form):
	email = forms.EmailField()
	password = forms.CharField(widget=forms.PasswordInput)
	
	def clean(self):
		# Validate authentication
		email = self.cleaned_data.get("email")
		password = self.cleaned_data.get("password")
		if(email and password):
			user = authenticate(username=email, password=password)

			'''If email and password are correct, it will return an User object
			So if not it will return None'''
			if user is None:
				raise forms.ValidationError(_("error_user_or_password_incorrect"))
			else:
				# if user is acive
				if not user.is_active:
					raise forms.ValidationError(_("error_account_not_activated"))
		
		return self.cleaned_data

class RecoverPasswordForm(forms.Form):
	email = forms.EmailField()
	
	def clean(self):
		# Check if the email address is associated to an account
		email = self.cleaned_data.get("email")
		if email:
			if not User.objects.filter(email=email).exists():
				raise forms.ValidationError(_("error_email_not_registered"))
		
		return self.cleaned_data

class ChangePasswordForm(forms.Form):
	old_password = forms.CharField(widget=forms.PasswordInput)
	new_password = forms.CharField(widget=forms.PasswordInput)
	new_password_repeat = forms.CharField(widget=forms.PasswordInput)

	def clean(self):
		# Check if passwords match
		new_password1 = self.cleaned_data.get("new_password")
		new_password2 = self.cleaned_data.get("new_password_repeat")

		if new_password1 != new_password2:
			raise forms.ValidationError(_("error_passwords_dont_match"))

		return self.cleaned_data

class ProfileForm(forms.Form):
	first_name = forms.CharField(max_length=15)
	last_name = forms.CharField(max_length=15)
	email = forms.EmailField()
