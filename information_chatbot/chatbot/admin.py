from django.contrib import admin
from .models import Student, Admin, Category, Pq, Chat, ChatMessage
# Register your models here.

admin.site.register(Student)
admin.site.register(Admin)
admin.site.register(Category)
admin.site.register(Pq)
admin.site.register(Chat)
admin.site.register(ChatMessage)
