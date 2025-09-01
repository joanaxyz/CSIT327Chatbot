from django.shortcuts import render
from .models import Student, Admin, Category, Pq, Chat, ChatMessage
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json

# For NLP
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# this template will be rendered on to the site if the corresponding url path is called
def index(request):
    return render(request, 'index.html')


def add_pq(request):
    if request.method == "POST":
        # fetching the data from the request object passed in the argument
        data = json.loads(request.body)
        question = data.get("question")
        answer = data.get("answer")
        category_name = data.get("category")

        # fetching the real category model instance along with its id and name
        # , means that the method returns a tuple (immutable set of elements)
        # _ means the following data returned can be discarded (excluded)
        category, _ = Category.objects.get_or_create(name=category_name)

        # creating and appending a pq object to the model
        pq = Pq.objects.create(question=question, answer=answer, category=category)
        
        # the append happens automatically

        return JsonResponse({"status" : "success", "id" : pq.id})
    return JsonResponse({"status" : "error"}, status=400)


def fetch_pqs(request):
    # the double underscore after category means that we are fetching the actual name, not the foreign key
    pqs = Pq.objects.all().values("id", "question", "answer", "category__name")
    return JsonResponse(list(pqs), safe=False)

def fetch_ans(request):
    if request.method == "POST":
        data = json.loads(request.body)
        user_query = data.get("question", "")

        if not user_query.strip():
            return JsonResponse({"status": "error", "message": "Empty query"}, status=400)

        # Get all stored questions + answers
        pqs = Pq.objects.all()
        if not pqs.exists():
            return JsonResponse({"status": "error", "message": "No data in DB"}, status=404)

        questions = [pq.question for pq in pqs]
        answers = [pq.answer for pq in pqs]

        # TF-IDF Vectorization
        vectorizer = TfidfVectorizer().fit(questions + [user_query])
        question_vecs = vectorizer.transform(questions)
        user_vec = vectorizer.transform([user_query])

        # Compute cosine similarity
        similarities = cosine_similarity(user_vec, question_vecs).flatten()

        # Find best match
        best_idx = similarities.argmax()
        best_score = similarities[best_idx]

        if best_score < 0.2:  # threshold for weak matches
            return JsonResponse({"status": "success", "answer": "Sorry, I couldn’t find a good match."})

        return JsonResponse({
            "status": "success",
            "question": questions[best_idx],
            "answer": answers[best_idx],
            "similarity": float(best_score)
        })

    return JsonResponse({"status": "error"}, status=400)




