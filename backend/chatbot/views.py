from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from products.models import Product
from .ai_utils import send_to_ai


class ChatAPIView(APIView):
    """
    Chatbot API using Groq LLM for intent detection and product search.
    """

    def post(self, request):
        message = request.data.get("message", "")

        # Send user message to AI model
        ai = send_to_ai(message)

        intent = ai.get("intent")
        payload = ai.get("payload", {})

        if intent == "search":
            return self.perform_search(payload, ai.get("reply", ""))

        # If intent is smalltalk or unknown
        return Response({
            "type": "text",
            "data": ai.get("reply", "Sorry, I didn't understand.")
        })

    def perform_search(self, payload, reply_text):
        """
        Filter products based on AI-extracted payload
        """
        category = payload.get("category")
        subcategory = payload.get("subcategory")
        max_price = payload.get("max_price")
        query = payload.get("query")

        qs = Product.objects.all()

        if category:
            qs = qs.filter(sub_category__main_category__name__icontains=category)

        if subcategory:
            qs = qs.filter(sub_category__name__icontains=subcategory)

        if max_price:
            qs = qs.filter(price__lte=max_price)

        if query:
            qs = qs.filter(name__icontains=query)

        data = self.serialize(qs[:20])

        return Response({
            "type": "products",
            "reply": reply_text,
            "data": data
        })

    def serialize(self, products):
        """
        Convert Product queryset into JSON-friendly format
        """
        data = []
        for p in products:
            first_image = None
            img_obj = p.images.first()  # ProductImages relation
            if img_obj:
                first_image = img_obj.images.url

            data.append({
                "id": p.id,
                "name": p.name,
                "main_category": p.sub_category.main_category.name,
                "sub_category": p.sub_category.name,
                "price": p.price,
                "image": first_image,
            })
        return data
