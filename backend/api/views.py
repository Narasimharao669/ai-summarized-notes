from django.shortcuts import render
from rest_framework import generics
from .serializer import NoteSerializer
from rest_framework.permissions import AllowAny 
from .models import Note
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
from openai import OpenAI
import requests 


class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [AllowAny] 

    def get_queryset(self):
      
        return Note.objects.all().order_by('-created_at')

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save()

class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Note.objects.all()

@api_view(['POST'])
def summarize_note(request, note_id):
    try:
       
        note = Note.objects.filter(id=note_id).first()
        if not note:
            return Response({"error": "Note not found"}, status=404)

        
        client = OpenAI(
            base_url="https://router.huggingface.co/v1",
            api_key=settings.HUGGINGFACE_API_KEY
        )

        
        completion = client.chat.completions.create(
            model="Qwen/Qwen2.5-7B-Instruct", 
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are DevDash AI, an expert Senior Developer and Tech Lead. "
                        "Your goal is to make the user smarter and faster. "
                        "Analyze the input text and respond using this specific structure:\n\n"
                        
                        "1. **The Gist**: A one-sentence high-level summary.\n"
                        "2. **Key Details**: Use bullet points (•) for the main concepts.\n"
                        "3. **Dev Insight**: If it's code, spot bugs or suggest a cleaner way to write it. "
                        "If it's a concept, give a quick analogy or a 'Why this matters' tip.\n\n"
                        
                        "RULES:\n"
                        "- Use Markdown formatting heavily (## Headers, **Bold**, `Code`).\n"
                        "- Keep it concise but punchy.\n"
                        "- If the user asks a question, answer it directly first."
                    )
                },
                {
                    "role": "user", 
                    "content": note.content
                }
            ],
            max_tokens=250 # Increased so it has space to explain code
        )

        
        summary = completion.choices[0].message.content.strip()
        return Response({"summary": summary})

    except Exception as e:
        print(f"AI Error: {e}")
        return Response({"error": str(e)}, status=500)