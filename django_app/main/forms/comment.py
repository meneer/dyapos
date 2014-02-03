from django import forms

class CommentForm(forms.Form):
	presentation_id = forms.IntegerField(widget=forms.HiddenInput)
	comment = forms.CharField(widget=forms.Textarea,
								max_length=500)
